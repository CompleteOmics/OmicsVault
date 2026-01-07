import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { Item, Location, RootStackParamList } from '../../types';
import { Card, Badge, EmptyState, LoadingSpinner } from '../../components/common';
import { QRCodeLabel } from '../../components/QRCodeLabel';
import { colors, spacing, borderRadius } from '../../utils/theme';

type LocationDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LocationDetail'>;
  route: RouteProp<RootStackParamList, 'LocationDetail'>;
};

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

// Item Card Component with delete functionality
function ItemCard({
  item,
  onPress,
  onDelete,
  deleting,
}: {
  item: Item;
  onPress: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const isLowStock = item.minQuantity != null && item.quantity <= item.minQuantity;
  const expirationStatus = getExpirationStatus(item);

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <Card style={styles.itemCard}>
      <TouchableOpacity onPress={onPress} style={styles.itemCardContent}>
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

          {item.vendor && (
            <Text style={styles.itemMetaText}>Vendor: {item.vendor}</Text>
          )}
        </View>

        <View style={styles.itemActions}>
          <IconButton
            icon="trash-can-outline"
            size={20}
            iconColor={colors.danger[500]}
            onPress={handleDelete}
            disabled={deleting}
          />
          <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} />
        </View>
      </TouchableOpacity>
    </Card>
  );
}

// Child Location Card Component
function ChildLocationCard({
  location,
  onPress,
}: {
  location: Location;
  onPress: () => void;
}) {
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

  return (
    <Card onPress={onPress} style={styles.childLocationCard}>
      <View style={styles.childLocationContent}>
        <View style={[styles.locationIcon, { backgroundColor: typeStyle.bg }]}>
          <Ionicons name="folder" size={20} color={typeStyle.text} />
        </View>
        <View style={styles.childLocationInfo}>
          <Text style={styles.childLocationName}>{location.name}</Text>
          <Text style={styles.childLocationType}>{location.type}</Text>
        </View>
        <Text style={styles.childLocationCount}>
          {location._count?.items || 0} items
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} />
      </View>
    </Card>
  );
}

export function LocationDetailScreen({ navigation, route }: LocationDetailScreenProps) {
  const { labId, locationId } = route.params;
  const [location, setLocation] = useState<Location | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showQRLabel, setShowQRLabel] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [locationData, itemsData] = await Promise.all([
        apiService.getLocation(labId, locationId),
        apiService.getItemsByLocation(labId, locationId),
      ]);
      setLocation(locationData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching location data:', error);
      Alert.alert('Error', 'Failed to load location details.');
    } finally {
      setLoading(false);
    }
  }, [labId, locationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleDeleteItem = async (itemId: string) => {
    setDeletingItemId(itemId);
    try {
      await apiService.deleteItem(labId, itemId);
      // Remove item from local state immediately for better UX
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      // Also update the location item count
      if (location) {
        setLocation({
          ...location,
          _count: {
            ...location._count,
            items: (location._count?.items || 1) - 1,
          },
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item. Please try again.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleNavigateToChild = (childLocationId: string) => {
    navigation.push('LocationDetail', { labId, locationId: childLocationId });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading location details..." />;
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="location-outline" size={64} color={colors.slate[300]} />
          <Text style={styles.notFoundText}>Location not found</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
  const childLocations = location.children || [];

  const renderHeader = () => (
    <View>
      {/* Location Info Card */}
      <Card style={styles.locationInfoCard}>
        <View style={styles.locationHeader}>
          <View style={[styles.locationIconLarge, { backgroundColor: typeStyle.bg }]}>
            <Ionicons name="location" size={32} color={typeStyle.text} />
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Badge variant="neutral">{location.type}</Badge>
          </View>
        </View>

        {location.description && (
          <Text style={styles.locationDescription}>{location.description}</Text>
        )}

        {location.parent && (
          <TouchableOpacity
            style={styles.parentLocationLink}
            onPress={() => navigation.push('LocationDetail', { labId, locationId: location.parent!.id })}
          >
            <Ionicons name="arrow-up" size={16} color={colors.primary[500]} />
            <Text style={styles.parentLocationText}>
              Parent: {location.parent.name}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{items.length}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          {childLocations.length > 0 && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{childLocations.length}</Text>
              <Text style={styles.statLabel}>Sub-locations</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Child Locations Section */}
      {childLocations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sub-locations</Text>
          {childLocations.map((child) => (
            <ChildLocationCard
              key={child.id}
              location={child}
              onPress={() => handleNavigateToChild(child.id)}
            />
          ))}
        </View>
      )}

      {/* Items Section Header */}
      <View style={styles.itemsSectionHeader}>
        <Text style={styles.sectionTitle}>Items ({items.length})</Text>
        <IconButton
          icon="plus"
          mode="contained"
          containerColor={colors.primary[500]}
          iconColor={colors.white}
          size={20}
          onPress={() => navigation.navigate('ItemCreate', { labId })}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: typeStyle.bg }]}>
            <Ionicons name="location" size={20} color={typeStyle.text} />
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {location.name}
            </Text>
            {location.parent && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {getLocationBreadcrumb(location.parent)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="qrcode"
            size={24}
            onPress={() => setShowQRLabel(true)}
          />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => navigation.navigate('ItemDetail', { labId, itemId: item.id })}
            onDelete={() => handleDeleteItem(item.id)}
            deleting={deletingItemId === item.id}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="No items in this location"
            description="Add items to this location to start tracking your inventory"
            actionLabel="Add Item"
            onAction={() => navigation.navigate('ItemCreate', { labId })}
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

      {/* QR Code Label */}
      <QRCodeLabel
        location={location}
        labId={labId}
        visible={showQRLabel}
        onDismiss={() => setShowQRLabel(false)}
      />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate[900],
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.slate[500],
  },
  headerActions: {
    flexDirection: 'row',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.slate[500],
    marginVertical: spacing.md,
  },
  goBackButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  goBackButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  locationInfoCard: {
    marginBottom: spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationIconLarge: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate[900],
    marginBottom: spacing.xs,
  },
  locationDescription: {
    fontSize: 14,
    color: colors.slate[600],
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  parentLocationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  parentLocationText: {
    fontSize: 14,
    color: colors.primary[700],
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.slate[900],
  },
  statLabel: {
    fontSize: 13,
    color: colors.slate[500],
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate[900],
    marginBottom: spacing.sm,
  },
  childLocationCard: {
    marginBottom: spacing.sm,
  },
  childLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  childLocationInfo: {
    flex: 1,
  },
  childLocationName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.slate[900],
  },
  childLocationType: {
    fontSize: 13,
    color: colors.slate[500],
  },
  childLocationCount: {
    fontSize: 13,
    color: colors.slate[500],
    marginRight: spacing.sm,
  },
  itemsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  itemCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
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
    marginRight: spacing.xs,
  },
  itemBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  itemMetaText: {
    fontSize: 12,
    color: colors.slate[500],
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
