import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { Text, Searchbar, Chip, IconButton, Menu, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { Item, Location, Activity, ExpirationData, RootStackParamList } from '../../types';
import { Card, Badge, EmptyState, LoadingSpinner } from '../../components/common';
import { colors, spacing, borderRadius, shadows } from '../../utils/theme';
import { format } from 'date-fns';

type LabScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Lab'>;
  route: RouteProp<RootStackParamList, 'Lab'>;
};

type TabId = 'items' | 'locations' | 'activity';

// Expiration Alerts Widget Component
function ExpirationAlertsWidget({
  expirationData,
  labId,
  navigation,
}: {
  expirationData: ExpirationData;
  labId: string;
  navigation: any;
}) {
  const { expiring, expired } = expirationData;

  if (expiring.length === 0 && expired.length === 0) return null;

  return (
    <Card style={styles.alertWidget}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <Ionicons name="calendar" size={24} color={colors.warning[600]} />
        </View>
        <Text style={styles.alertTitle}>Expiration Alerts</Text>
      </View>

      {expired.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={styles.alertSectionTitle}>
            {expired.length} expired item{expired.length > 1 ? 's' : ''}
          </Text>
          {expired.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.alertItem}
              onPress={() => navigation.navigate('ItemDetail', { labId, itemId: item.id })}
            >
              <View style={styles.alertItemInfo}>
                <Text style={styles.alertItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.alertItemLocation}>
                  {item.location?.name} - Expired{' '}
                  {item.expirationDate && format(new Date(item.expirationDate), 'MMM d')}
                </Text>
              </View>
              <Badge variant="danger">Expired</Badge>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {expiring.length > 0 && (
        <View style={styles.alertSection}>
          <Text style={styles.alertSectionTitle}>
            {expiring.length} item{expiring.length > 1 ? 's' : ''} expiring soon
          </Text>
          {expiring.slice(0, 3).map((item) => {
            const daysUntil = item.expirationDate
              ? Math.ceil(
                  (new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
              : 0;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.alertItem}
                onPress={() => navigation.navigate('ItemDetail', { labId, itemId: item.id })}
              >
                <View style={styles.alertItemInfo}>
                  <Text style={styles.alertItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.alertItemLocation}>
                    {item.location?.name} - Expires{' '}
                    {item.expirationDate && format(new Date(item.expirationDate), 'MMM d')}
                  </Text>
                </View>
                <Badge variant={daysUntil <= 7 ? 'danger' : 'warning'}>
                  {daysUntil}d
                </Badge>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </Card>
  );
}

// Item Card Component
function ItemCard({
  item,
  onPress,
}: {
  item: Item;
  onPress: () => void;
}) {
  const isLowStock = item.minQuantity != null && item.quantity <= item.minQuantity;
  const expirationStatus = getExpirationStatus(item);

  return (
    <Card onPress={onPress} style={styles.itemCard}>
      <View style={styles.itemCardContent}>
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            {isLowStock && (
              <Badge variant="warning" icon={<Ionicons name="warning" size={12} color={colors.warning[700]} />}>
                Low Stock
              </Badge>
            )}
            {expirationStatus && expirationStatus.status !== 'ok' && (
              <Badge variant={expirationStatus.status === 'expired' ? 'danger' : 'warning'}>
                {expirationStatus.status === 'expired'
                  ? 'Expired'
                  : `${expirationStatus.days}d`}
              </Badge>
            )}
          </View>

          <View style={styles.itemBadges}>
            {item.category && <Badge variant="info">{item.category}</Badge>}
            <Badge variant="neutral">
              {item.quantity} {item.unit || 'units'}
            </Badge>
          </View>

          <View style={styles.itemMeta}>
            {item.vendor && (
              <Text style={styles.itemMetaText}>Vendor: {item.vendor}</Text>
            )}
            <Text style={styles.itemLocation}>
              <Ionicons name="location" size={12} color={colors.slate[400]} />{' '}
              {getLocationBreadcrumb(item.location)}
            </Text>
          </View>
        </View>

        {item.photos?.[0] && (
          <View style={styles.itemPhotoContainer}>
            {/* Photo thumbnail placeholder */}
          </View>
        )}

        <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} />
      </View>
    </Card>
  );
}

// Location Tree Component
function LocationTree({
  location,
  locations,
  labId,
  navigation,
  depth = 0,
}: {
  location: Location;
  locations: Location[];
  labId: string;
  navigation: any;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = locations.filter((loc) => loc.parentId === location.id);

  const typeColors: Record<string, { bg: string; text: string }> = {
    Room: { bg: colors.primary[50], text: colors.primary[600] },
    Freezer: { bg: colors.slate[100], text: colors.slate[600] },
    Refrigerator: { bg: colors.slate[100], text: colors.slate[600] },
    Cabinet: { bg: colors.warning[50], text: colors.warning[600] },
    Shelf: { bg: colors.success[50], text: colors.success[600] },
    Rack: { bg: colors.primary[50], text: colors.primary[600] },
    Box: { bg: colors.danger[50], text: colors.danger[600] },
  };

  const typeStyle = typeColors[location.type] || { bg: colors.slate[100], text: colors.slate[600] };

  const handleLocationPress = () => {
    navigation.navigate('LocationDetail', { labId, locationId: location.id });
  };

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.locationNode, { marginLeft: depth * 24 }]}>
      <Card style={styles.locationCard}>
        <TouchableOpacity onPress={handleLocationPress} activeOpacity={0.7}>
          <View style={styles.locationContent}>
            {children.length > 0 && (
              <TouchableOpacity
                onPress={handleExpandToggle}
                style={styles.expandButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={expanded ? 'chevron-down' : 'chevron-forward'}
                  size={16}
                  color={colors.slate[400]}
                />
              </TouchableOpacity>
            )}
            <View style={[styles.locationIcon, { backgroundColor: typeStyle.bg }]}>
              <Ionicons name="folder" size={20} color={typeStyle.text} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationType}>{location.type}</Text>
            </View>
            <Text style={styles.locationCount}>
              {location._count?.items || 0} items
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} style={styles.locationChevron} />
          </View>
        </TouchableOpacity>
      </Card>

      {expanded && children.length > 0 && (
        <View style={styles.locationChildren}>
          {children.map((child) => (
            <LocationTree
              key={child.id}
              location={child}
              locations={locations}
              labId={labId}
              navigation={navigation}
              depth={depth + 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Activity Item Component
function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <Card style={styles.activityCard}>
      <View style={styles.activityContent}>
        <View style={styles.activityAvatar}>
          <Text style={styles.activityAvatarText}>
            {activity.user.name[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text style={styles.activityTime}>
            {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
          </Text>
        </View>
      </View>
    </Card>
  );
}

// Helper functions
function getExpirationStatus(item: Item) {
  if (!item.expirationDate) return null;
  const now = new Date();
  const expDate = new Date(item.expirationDate);
  const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return { status: 'expired' as const, days: Math.abs(daysUntilExpiry) };
  if (daysUntilExpiry <= 7) return { status: 'critical' as const, days: daysUntilExpiry };
  if (daysUntilExpiry <= 30) return { status: 'warning' as const, days: daysUntilExpiry };
  return { status: 'ok' as const, days: daysUntilExpiry };
}

function getLocationBreadcrumb(location?: Location): string {
  if (!location) return 'Unknown';
  const parts: string[] = [];
  let current: Location | undefined = location;
  while (current) {
    parts.unshift(current.name);
    current = current.parent;
  }
  return parts.join(' > ');
}

export function LabScreen({ navigation, route }: LabScreenProps) {
  const { labId } = route.params;
  const [activeTab, setActiveTab] = useState<TabId>('items');
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expirationData, setExpirationData] = useState<ExpirationData>({ expiring: [], expired: [] });
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [itemsData, locationsData, activitiesData, expiringData] = await Promise.all([
        apiService.getItems(labId, { search, lowStock: lowStockOnly }),
        apiService.getLocations(labId),
        apiService.getActivities(labId, 20),
        apiService.getExpiringItems(labId, 30),
      ]);
      setItems(itemsData);
      setLocations(locationsData);
      setActivities(activitiesData);
      setExpirationData(expiringData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [labId, search, lowStockOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleDeleteLab = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Lab',
      'Are you sure you want to delete this lab? This action cannot be undone and will delete all items, locations, and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteLab(labId);
              Alert.alert('Success', 'Lab deleted successfully');
              navigation.goBack();
            } catch (error: any) {
              console.error('Error deleting lab:', error);
              const message = error.response?.data?.error || 'Failed to delete lab. Please try again.';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const handleInviteMembers = async () => {
    setMenuVisible(false);
    setGeneratingInvite(true);
    try {
      const invite = await apiService.createInvite(labId, { expiresInDays: 7 });
      setInviteToken(invite.token);
      setInviteModalVisible(true);
    } catch (error) {
      console.error('Error creating invite:', error);
      Alert.alert('Error', 'Failed to create invite. Please try again.');
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join my lab on OmicsVault! Use this invite code: ${inviteToken}`,
        title: 'Join OmicsVault Lab',
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
    }
  };

  const handleJoinLab = () => {
    setMenuVisible(false);
    setJoinModalVisible(true);
  };

  const handleJoinWithToken = async () => {
    if (!joinToken.trim()) return;

    try {
      await apiService.joinLabWithInvite(joinToken.trim());
      setJoinModalVisible(false);
      setJoinToken('');
      Alert.alert('Success', 'Successfully joined the lab!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error joining lab:', error);
      const message = error.response?.data?.error || 'Failed to join lab. Please check the invite code and try again.';
      Alert.alert('Error', message);
    }
  };

  const tabs: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: 'items', label: 'Items', icon: 'cube-outline', count: items.length },
    { id: 'locations', label: 'Locations', icon: 'location-outline', count: locations.length },
    { id: 'activity', label: 'Activity', icon: 'time-outline' },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading lab data..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoIcon}>
            <Ionicons name="cube" size={20} color={colors.white} />
          </View>
          <Text style={styles.headerTitle}>OmicsVault</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="plus"
            mode="contained"
            containerColor={colors.primary[500]}
            iconColor={colors.white}
            size={24}
            onPress={() => navigation.navigate('ItemCreate', { labId })}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item onPress={handleInviteMembers} title="Invite Members" leadingIcon="account-plus" />
            <Menu.Item onPress={handleJoinLab} title="Join Another Lab" leadingIcon="login" />
            <Menu.Item onPress={handleDeleteLab} title="Delete Lab" leadingIcon="delete" />
          </Menu>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.id ? colors.slate[900] : colors.slate[500]}
              />
              <Text
                style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
              {tab.count !== undefined && (
                <View
                  style={[
                    styles.tabBadge,
                    activeTab === tab.id && styles.tabBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      activeTab === tab.id && styles.tabBadgeTextActive,
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <View style={styles.tabContent}>
          {/* Search & Filters */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search items..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchbar}
              inputStyle={styles.searchInput}
              iconColor={colors.slate[400]}
            />
            <Chip
              selected={lowStockOnly}
              onPress={() => setLowStockOnly(!lowStockOnly)}
              style={[styles.filterChip, lowStockOnly && styles.filterChipActive]}
              textStyle={[styles.filterChipText, lowStockOnly && styles.filterChipTextActive]}
            >
              Low stock
            </Chip>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onPress={() => navigation.navigate('ItemDetail', { labId, itemId: item.id })}
              />
            )}
            ListHeaderComponent={
              !search && !lowStockOnly ? (
                <ExpirationAlertsWidget
                  expirationData={expirationData}
                  labId={labId}
                  navigation={navigation}
                />
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                icon="cube-outline"
                title={search || lowStockOnly ? 'No items found' : 'No items yet'}
                description={
                  search || lowStockOnly
                    ? 'Try adjusting your search or filters'
                    : 'Add your first item to start tracking your lab inventory'
                }
                actionLabel={!search && !lowStockOnly ? 'Add Your First Item' : undefined}
                onAction={
                  !search && !lowStockOnly
                    ? () => navigation.navigate('ItemCreate', { labId })
                    : undefined
                }
              />
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary[500]]}
                tintColor={colors.primary[500]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <View style={styles.tabContent}>
          <View style={styles.tabActions}>
            <IconButton
              icon="plus"
              mode="contained"
              containerColor={colors.primary[500]}
              iconColor={colors.white}
              size={24}
              onPress={() => navigation.navigate('LocationCreate', { labId })}
            />
          </View>

          <FlatList
            data={locations.filter((loc) => !loc.parentId)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LocationTree
                location={item}
                locations={locations}
                labId={labId}
                navigation={navigation}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="location-outline"
                title="No locations yet"
                description="Create locations to organize where your items are stored"
                actionLabel="Add Your First Location"
                onAction={() => navigation.navigate('LocationCreate', { labId })}
              />
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary[500]]}
                tintColor={colors.primary[500]}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityItem activity={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="No activity yet"
              description="Activity will appear here as items are added, moved, or updated"
            />
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Invite Modal */}
      <Portal>
        <Modal
          visible={inviteModalVisible}
          onDismiss={() => setInviteModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Members</Text>
            <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.slate[500]} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>
              Share this invite code with others to let them join your lab. This code will expire in 7 days.
            </Text>

            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCodeLabel}>Invite Code</Text>
              <View style={styles.inviteCodeBox}>
                <Text style={styles.inviteCode} selectable>{inviteToken}</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button
              mode="contained"
              onPress={handleShareInvite}
              style={styles.shareButton}
              icon="share"
            >
              Share Invite
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Join Lab Modal */}
      <Portal>
        <Modal
          visible={joinModalVisible}
          onDismiss={() => setJoinModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join Lab</Text>
            <TouchableOpacity onPress={() => setJoinModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.slate[500]} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>
              Enter the invite code you received to join a lab.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                mode="outlined"
                value={joinToken}
                onChangeText={setJoinToken}
                placeholder="Enter invite code..."
                style={styles.input}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setJoinModalVisible(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleJoinWithToken}
              disabled={!joinToken.trim()}
              style={styles.joinButton}
            >
              Join Lab
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate[900],
    marginLeft: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  tabsContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.slate[100],
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadows.small,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate[500],
    marginLeft: spacing.xs,
  },
  tabTextActive: {
    color: colors.slate[900],
  },
  tabBadge: {
    marginLeft: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.slate[200],
  },
  tabBadgeActive: {
    backgroundColor: colors.primary[100],
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate[600],
  },
  tabBadgeTextActive: {
    color: colors.primary[700],
  },
  tabContent: {
    flex: 1,
  },
  tabActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: 0,
    gap: spacing.sm,
  },
  searchbar: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  searchInput: {
    fontSize: 14,
  },
  filterChip: {
    backgroundColor: colors.white,
    borderColor: colors.slate[200],
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  filterChipText: {
    color: colors.slate[700],
    fontSize: 13,
  },
  filterChipTextActive: {
    color: colors.primary[700],
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  // Alert Widget styles
  alertWidget: {
    marginBottom: spacing.md,
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.warning[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning[900],
  },
  alertSection: {
    marginBottom: spacing.md,
  },
  alertSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning[800],
    marginBottom: spacing.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  alertItemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  alertItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate[900],
  },
  alertItemLocation: {
    fontSize: 12,
    color: colors.slate[500],
    marginTop: 2,
  },
  // Item Card styles
  itemCard: {
    marginBottom: spacing.sm,
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate[900],
  },
  itemBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  itemMeta: {
    gap: 2,
  },
  itemMetaText: {
    fontSize: 12,
    color: colors.slate[500],
  },
  itemLocation: {
    fontSize: 12,
    color: colors.slate[500],
  },
  itemPhotoContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.slate[100],
    marginRight: spacing.sm,
  },
  // Location styles
  locationNode: {
    marginBottom: spacing.sm,
  },
  locationCard: {
    padding: spacing.md,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.slate[900],
  },
  locationType: {
    fontSize: 13,
    color: colors.slate[500],
  },
  locationCount: {
    fontSize: 13,
    color: colors.slate[500],
    marginRight: spacing.xs,
  },
  locationChevron: {
    marginLeft: spacing.xs,
  },
  locationChildren: {
    marginTop: spacing.xs,
    borderLeftWidth: 2,
    borderLeftColor: colors.slate[200],
    marginLeft: spacing.lg,
  },
  // Activity styles
  activityCard: {
    marginBottom: spacing.sm,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.slate[700],
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: colors.slate[400],
    marginTop: 4,
  },
  // Modal styles
  modalContent: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.slate[900],
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.slate[600],
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate[700],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
  },
  inviteCodeContainer: {
    marginTop: spacing.md,
  },
  inviteCodeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate[700],
    marginBottom: spacing.xs,
  },
  inviteCodeBox: {
    backgroundColor: colors.slate[50],
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  inviteCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: colors.slate[900],
    textAlign: 'center',
  },
  shareButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  cancelButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.slate[300],
  },
  joinButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
});
