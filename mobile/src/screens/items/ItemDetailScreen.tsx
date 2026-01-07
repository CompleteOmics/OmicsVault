import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Button,
  Portal,
  Modal,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import apiService from '../../services/api';
import { Item, Location, RootStackParamList } from '../../types';
import { Card, Badge, LoadingSpinner } from '../../components/common';
import { QRCodeLabel } from '../../components/QRCodeLabel';
import { colors, spacing, borderRadius, shadows } from '../../utils/theme';
import { format } from 'date-fns';

type ItemDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ItemDetail'>;
  route: RouteProp<RootStackParamList, 'ItemDetail'>;
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

export function ItemDetailScreen({ navigation, route }: ItemDetailScreenProps) {
  const { labId, itemId } = route.params;
  const [item, setItem] = useState<Item | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showQRLabel, setShowQRLabel] = useState(false);
  const [moveToLocationId, setMoveToLocationId] = useState('');
  const [moving, setMoving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [itemData, locationsData] = await Promise.all([
        apiService.getItem(labId, itemId),
        apiService.getLocations(labId),
      ]);
      setItem(itemData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [labId, itemId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleMove = async () => {
    if (!moveToLocationId) return;
    setMoving(true);
    try {
      await apiService.moveItem(labId, itemId, moveToLocationId);
      await fetchData();
      setShowMoveModal(false);
      setMoveToLocationId('');
    } catch (error) {
      console.error('Error moving item:', error);
      Alert.alert('Error', 'Failed to move item. Please try again.');
    } finally {
      setMoving(false);
    }
  };

  const handleGenerateQR = () => {
    setShowQRLabel(true);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera access is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Camera Unavailable',
        'Camera is not available on this device. This feature requires a physical iOS device with a camera. You can use "Pick from Library" instead.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    setUploading(true);
    try {
      await apiService.uploadPhoto(labId, itemId, uri);
      await fetchData();
      Alert.alert('Success', 'Photo uploaded successfully.');
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose a method to add a photo',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickPhoto },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading item details..." />;
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.slate[300]} />
          <Text style={styles.notFoundText}>Item not found</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const isLowStock = item.minQuantity != null && item.quantity <= item.minQuantity;
  const expirationStatus = getExpirationStatus(item);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="qrcode"
            size={24}
            onPress={handleGenerateQR}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Expiration Alert */}
        {expirationStatus && expirationStatus.status !== 'ok' && (
          <View
            style={[
              styles.expirationAlert,
              expirationStatus.status === 'expired'
                ? styles.alertDanger
                : expirationStatus.status === 'critical'
                ? styles.alertDanger
                : styles.alertWarning,
            ]}
          >
            <View
              style={[
                styles.alertIcon,
                expirationStatus.status === 'expired' || expirationStatus.status === 'critical'
                  ? styles.alertIconDanger
                  : styles.alertIconWarning,
              ]}
            >
              <Ionicons name="calendar" size={24} color={colors.white} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {expirationStatus.status === 'expired'
                  ? `Expired ${expirationStatus.days} days ago`
                  : `Expires in ${expirationStatus.days} days`}
              </Text>
              <Text style={styles.alertDescription}>
                {expirationStatus.status === 'expired'
                  ? 'This item has expired and should not be used.'
                  : 'Plan to use it soon or coordinate with your team.'}
              </Text>
            </View>
          </View>
        )}

        {/* Item Details Card */}
        <Card style={styles.detailCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.badges}>
              {item.category && <Badge variant="info">{item.category}</Badge>}
              {isLowStock && <Badge variant="warning">Low Stock</Badge>}
              {expirationStatus?.status === 'expired' && (
                <Badge variant="danger">Expired</Badge>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              icon="swap-horizontal"
              onPress={() => setShowMoveModal(true)}
              style={styles.actionButton}
            >
              Move
            </Button>
            <Button
              mode="outlined"
              icon="camera"
              onPress={handlePhotoOptions}
              loading={uploading}
              disabled={uploading}
              style={styles.actionButton}
            >
              Photo
            </Button>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Vendor</Text>
              <Text style={styles.detailValue}>{item.vendor || 'Not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Catalog Number</Text>
              <Text style={styles.detailValue}>{item.catalogNumber || 'Not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lot Number</Text>
              <Text style={styles.detailValue}>{item.lotNumber || 'Not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={[styles.detailValue, isLowStock && styles.lowStockValue]}>
                {item.quantity} {item.unit || 'units'}
              </Text>
            </View>
            {item.minQuantity != null && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Minimum Quantity</Text>
                <Text style={styles.detailValue}>
                  {item.minQuantity} {item.unit || 'units'}
                </Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <View style={styles.locationValue}>
                <Ionicons name="location" size={14} color={colors.slate[400]} />
                <Text style={styles.detailValue}>{getLocationBreadcrumb(item.location)}</Text>
              </View>
            </View>
            {item.expirationDate && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Expiration Date</Text>
                <Text
                  style={[
                    styles.detailValue,
                    expirationStatus?.status === 'expired' && styles.expiredValue,
                    expirationStatus?.status === 'critical' && styles.expiredValue,
                    expirationStatus?.status === 'warning' && styles.warningValue,
                  ]}
                >
                  {format(new Date(item.expirationDate), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
            {item.openedDate && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Opened Date</Text>
                <Text style={styles.detailValue}>
                  {format(new Date(item.openedDate), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
          </View>

          {item.remarks && (
            <View style={styles.remarksSection}>
              <Text style={styles.remarksLabel}>Remarks</Text>
              <Text style={styles.remarksText}>{item.remarks}</Text>
            </View>
          )}

          <View style={styles.metaSection}>
            <Text style={styles.metaText}>Created by {item.createdBy.name}</Text>
            <Text style={styles.metaText}>
              Last updated by {item.lastUpdatedBy?.name || 'Unknown'}
            </Text>
            <Text style={styles.metaText}>
              {format(new Date(item.updatedAt), 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
        </Card>

        {/* Photos Card */}
        <Card style={styles.photosCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <IconButton
              icon="plus"
              mode="contained"
              containerColor={colors.primary[500]}
              iconColor={colors.white}
              size={20}
              onPress={handlePhotoOptions}
            />
          </View>

          {item.photos.length === 0 ? (
            <View style={styles.emptyPhotos}>
              <Ionicons name="image-outline" size={40} color={colors.slate[300]} />
              <Text style={styles.emptyPhotosText}>No photos yet</Text>
              <Button mode="text" onPress={handlePhotoOptions}>
                Add photo
              </Button>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.photos.map((photo) => (
                <View key={photo.id} style={styles.photoContainer}>
                  <Image source={{ uri: photo.url }} style={styles.photo} />
                </View>
              ))}
            </ScrollView>
          )}
        </Card>

        {/* Movement History Card */}
        <Card style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Movement History</Text>

          {item.movements.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="swap-horizontal" size={40} color={colors.slate[300]} />
              <Text style={styles.emptyHistoryText}>No movements recorded</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {item.movements.map((movement, index) => (
                <View key={movement.id} style={styles.historyItem}>
                  <View style={styles.historyLine}>
                    <View style={styles.historyDot} />
                    {index < item.movements.length - 1 && (
                      <View style={styles.historyConnector} />
                    )}
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyText}>
                      Moved from <Text style={styles.bold}>{movement.fromLocation.name}</Text> to{' '}
                      <Text style={styles.bold}>{movement.toLocation.name}</Text>
                    </Text>
                    <Text style={styles.historyMeta}>
                      By {movement.movedBy.name} on{' '}
                      {format(new Date(movement.movedAt), 'MMM d, yyyy h:mm a')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Move Modal */}
      <Portal>
        <Modal
          visible={showMoveModal}
          onDismiss={() => setShowMoveModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Move Item</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowMoveModal(false)}
            />
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.label}>New Location</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={moveToLocationId}
                onValueChange={setMoveToLocationId}
                style={styles.picker}
              >
                <Picker.Item label="Select a location" value="" />
                {locations
                  .filter((loc) => loc.id !== item.locationId)
                  .map((loc) => (
                    <Picker.Item
                      key={loc.id}
                      label={`${loc.name} (${loc.type})`}
                      value={loc.id}
                    />
                  ))}
              </Picker>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setShowMoveModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleMove}
              loading={moving}
              disabled={!moveToLocationId || moving}
              style={styles.modalButton}
            >
              Move Item
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* QR Code Label */}
      <QRCodeLabel
        item={item}
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
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.slate[900],
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
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
  expirationAlert: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  alertDanger: {
    backgroundColor: colors.danger[50],
    borderWidth: 1,
    borderColor: colors.danger[200],
  },
  alertWarning: {
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertIconDanger: {
    backgroundColor: colors.danger[500],
  },
  alertIconWarning: {
    backgroundColor: colors.warning[500],
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate[900],
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 13,
    color: colors.slate[600],
  },
  detailCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.slate[900],
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailItem: {
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.slate[500],
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.slate[900],
  },
  lowStockValue: {
    color: colors.warning[600],
  },
  expiredValue: {
    color: colors.danger[600],
  },
  warningValue: {
    color: colors.warning[600],
  },
  locationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  remarksSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  remarksLabel: {
    fontSize: 13,
    color: colors.slate[500],
    marginBottom: spacing.xs,
  },
  remarksText: {
    fontSize: 14,
    color: colors.slate[700],
    lineHeight: 20,
  },
  metaSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  metaText: {
    fontSize: 12,
    color: colors.slate[400],
    marginBottom: 2,
  },
  photosCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate[900],
    flex: 1,
  },
  emptyPhotos: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyPhotosText: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: spacing.sm,
  },
  photoContainer: {
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: 100,
    height: 100,
  },
  historyCard: {
    marginBottom: spacing.md,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: spacing.sm,
  },
  historyList: {
    marginTop: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
  },
  historyLine: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[500],
  },
  historyConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.slate[200],
    marginVertical: 4,
  },
  historyContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  historyText: {
    fontSize: 14,
    color: colors.slate[700],
  },
  bold: {
    fontWeight: '600',
  },
  historyMeta: {
    fontSize: 12,
    color: colors.slate[500],
    marginTop: 4,
  },
  modalContent: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  qrModalContent: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate[700],
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
  },
  modalButton: {
    flex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  qrImage: {
    width: 200,
    height: 200,
    backgroundColor: colors.white,
  },
  qrHint: {
    fontSize: 13,
    color: colors.slate[500],
    marginTop: spacing.md,
  },
});
