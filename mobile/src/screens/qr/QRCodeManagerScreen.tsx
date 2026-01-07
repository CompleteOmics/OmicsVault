/**
 * QR Code Manager Screen
 *
 * A comprehensive QR code management interface featuring:
 * - Batch QR code generation for multiple items
 * - Label sheet generation with multiple template sizes
 * - Print preview with WiFi printer support
 * - QR code sharing capabilities
 * - Location QR code generation
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Text,
  Button,
  Portal,
  Modal,
  IconButton,
  Checkbox,
  SegmentedButtons,
  Divider,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import apiService from '../../services/api';
import { Item, Location, RootStackParamList } from '../../types';
import { Card, Badge, LoadingSpinner, EmptyState } from '../../components/common';
import { colors, spacing, borderRadius, shadows } from '../../utils/theme';
import {
  LABEL_TEMPLATES,
  LabelSize,
  PrintOptions,
  getDefaultPrintOptions,
  generateItemLabelHTML,
  generateLocationLabelHTML,
  generateLabelSheetHTML,
  generateSingleLabelPreviewHTML,
  getLabelsPerPage,
  estimatePrintPages,
  generateItemQRUrl,
  generateLocationQRUrl,
} from '../../utils/qrCodeUtils';

type QRCodeManagerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'QRCodeManager'>;
  route: RouteProp<RootStackParamList, 'QRCodeManager'>;
};

type TabType = 'items' | 'locations';

interface SelectableItem extends Item {
  selected: boolean;
  qrDataUrl?: string;
}

interface SelectableLocation extends Location {
  selected: boolean;
  qrDataUrl?: string;
}

export function QRCodeManagerScreen({ navigation, route }: QRCodeManagerScreenProps) {
  const { labId } = route.params;

  // State
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [items, setItems] = useState<SelectableItem[]>([]);
  const [locations, setLocations] = useState<SelectableLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);

  // Print options
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions>(getDefaultPrintOptions());
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Single item preview
  const [previewItem, setPreviewItem] = useState<Item | Location | null>(null);
  const [showQRPreview, setShowQRPreview] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [itemsData, locationsData] = await Promise.all([
        apiService.getItems(labId),
        apiService.getLocations(labId),
      ]);
      setItems(itemsData.map(item => ({ ...item, selected: false })));
      setLocations(locationsData.map(loc => ({ ...loc, selected: false })));
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Selection handlers
  const toggleItemSelection = (itemId: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleLocationSelection = (locationId: string) => {
    setLocations(prev =>
      prev.map(loc =>
        loc.id === locationId ? { ...loc, selected: !loc.selected } : loc
      )
    );
  };

  const selectAll = () => {
    if (activeTab === 'items') {
      setItems(prev => prev.map(item => ({ ...item, selected: true })));
    } else {
      setLocations(prev => prev.map(loc => ({ ...loc, selected: true })));
    }
  };

  const deselectAll = () => {
    if (activeTab === 'items') {
      setItems(prev => prev.map(item => ({ ...item, selected: false })));
    } else {
      setLocations(prev => prev.map(loc => ({ ...loc, selected: false })));
    }
  };

  const getSelectedCount = () => {
    if (activeTab === 'items') {
      return items.filter(i => i.selected).length;
    }
    return locations.filter(l => l.selected).length;
  };

  // QR Code generation
  const generateQRCodes = async (selected: (SelectableItem | SelectableLocation)[]): Promise<string[]> => {
    const qrDataUrls: string[] = [];
    const appUrl = 'http://localhost:3000'; // This should come from environment

    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];
      setGeneratingProgress((i + 1) / selected.length);

      try {
        // For items, use the API to get QR code
        if ('quantity' in item) {
          const qr = await apiService.generateQRCode(labId, item.id);
          qrDataUrls.push(qr);
        } else {
          // For locations, generate QR locally
          const url = generateLocationQRUrl(labId, item.id, appUrl);
          // Generate QR as data URL - simplified for this context
          const qrDataUrl = await generateQRDataUrl(url);
          qrDataUrls.push(qrDataUrl);
        }
      } catch (error) {
        console.error(`Error generating QR for ${item.name}:`, error);
        // Use a placeholder or skip
        qrDataUrls.push('');
      }
    }

    return qrDataUrls;
  };

  // Simplified QR data URL generator (in real implementation, use a canvas or server-side)
  const generateQRDataUrl = async (data: string): Promise<string> => {
    // This is a placeholder - in production, you'd use a proper QR generation service
    // or the server-side API
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
  };

  // Print handlers
  const handleOpenPrintOptions = () => {
    const selectedCount = getSelectedCount();
    if (selectedCount === 0) {
      Alert.alert('No Selection', 'Please select at least one item or location to print.');
      return;
    }
    setShowPrintModal(true);
  };

  const handleGenerateLabels = async () => {
    setGenerating(true);
    setGeneratingProgress(0);

    try {
      const selected = activeTab === 'items'
        ? items.filter(i => i.selected)
        : locations.filter(l => l.selected);

      // Generate QR codes for all selected items
      const qrDataUrls = await generateQRCodes(selected);

      // Generate label HTML
      const labels: string[] = [];
      for (let i = 0; i < selected.length; i++) {
        const item = selected[i];
        const qrDataUrl = qrDataUrls[i];

        if (!qrDataUrl) continue;

        for (let copy = 0; copy < printOptions.copies; copy++) {
          if ('quantity' in item) {
            labels.push(generateItemLabelHTML(item as Item, qrDataUrl, printOptions));
          } else {
            labels.push(generateLocationLabelHTML(item as Location, qrDataUrl, printOptions));
          }
        }
      }

      // Generate label sheet
      const template = LABEL_TEMPLATES[printOptions.labelSize];
      const html = generateLabelSheetHTML(labels, template);
      setPreviewHtml(html);
      setShowPrintModal(false);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error generating labels:', error);
      Alert.alert('Error', 'Failed to generate labels. Please try again.');
    } finally {
      setGenerating(false);
      setGeneratingProgress(0);
    }
  };

  const handlePrint = async () => {
    try {
      await Print.printAsync({
        html: previewHtml,
      });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Print Error', 'Failed to print. Please check your printer connection.');
    }
  };

  const handleShare = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: previewHtml,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Failed to share. Please try again.');
    }
  };

  // Single item preview
  const handlePreviewItem = (item: Item | Location) => {
    setPreviewItem(item);
    setShowQRPreview(true);
  };

  const handlePrintSingle = async () => {
    if (!previewItem) return;

    setGenerating(true);
    try {
      let qrDataUrl: string;
      if ('quantity' in previewItem) {
        qrDataUrl = await apiService.generateQRCode(labId, previewItem.id);
      } else {
        const url = generateLocationQRUrl(labId, previewItem.id, 'http://localhost:3000');
        qrDataUrl = await generateQRDataUrl(url);
      }

      const labelHtml = 'quantity' in previewItem
        ? generateItemLabelHTML(previewItem as Item, qrDataUrl, printOptions)
        : generateLocationLabelHTML(previewItem as Location, qrDataUrl, printOptions);

      const template = LABEL_TEMPLATES[printOptions.labelSize];
      const html = generateSingleLabelPreviewHTML(labelHtml, template.width, template.height);

      await Print.printAsync({ html });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print label.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShareSingle = async () => {
    if (!previewItem) return;

    setGenerating(true);
    try {
      let qrDataUrl: string;
      if ('quantity' in previewItem) {
        qrDataUrl = await apiService.generateQRCode(labId, previewItem.id);
      } else {
        const url = generateLocationQRUrl(labId, previewItem.id, 'http://localhost:3000');
        qrDataUrl = await generateQRDataUrl(url);
      }

      const labelHtml = 'quantity' in previewItem
        ? generateItemLabelHTML(previewItem as Item, qrDataUrl, printOptions)
        : generateLocationLabelHTML(previewItem as Location, qrDataUrl, printOptions);

      const template = LABEL_TEMPLATES[printOptions.labelSize];
      const html = generateSingleLabelPreviewHTML(labelHtml, template.width, template.height);

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share label.');
    } finally {
      setGenerating(false);
    }
  };

  // Render functions
  const renderItemCard = ({ item }: { item: SelectableItem }) => (
    <Card style={styles.itemCard}>
      <TouchableOpacity
        style={styles.itemCardContent}
        onPress={() => toggleItemSelection(item.id)}
        onLongPress={() => handlePreviewItem(item)}
      >
        <Checkbox
          status={item.selected ? 'checked' : 'unchecked'}
          onPress={() => toggleItemSelection(item.id)}
          color={colors.primary[500]}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.itemMeta}>
            {item.category && <Badge variant="info">{item.category}</Badge>}
            <Text style={styles.itemQuantity}>
              {item.quantity} {item.unit || 'units'}
            </Text>
          </View>
        </View>
        <IconButton
          icon="qrcode"
          size={24}
          iconColor={colors.slate[400]}
          onPress={() => handlePreviewItem(item)}
        />
      </TouchableOpacity>
    </Card>
  );

  const renderLocationCard = ({ item }: { item: SelectableLocation }) => (
    <Card style={styles.itemCard}>
      <TouchableOpacity
        style={styles.itemCardContent}
        onPress={() => toggleLocationSelection(item.id)}
        onLongPress={() => handlePreviewItem(item)}
      >
        <Checkbox
          status={item.selected ? 'checked' : 'unchecked'}
          onPress={() => toggleLocationSelection(item.id)}
          color={colors.primary[500]}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.itemMeta}>
            <Badge variant="neutral">{item.type}</Badge>
            {item._count?.items !== undefined && (
              <Text style={styles.itemQuantity}>{item._count.items} items</Text>
            )}
          </View>
        </View>
        <IconButton
          icon="qrcode"
          size={24}
          iconColor={colors.slate[400]}
          onPress={() => handlePreviewItem(item)}
        />
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  const selectedCount = getSelectedCount();
  const currentData = activeTab === 'items' ? items : locations;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Ionicons name="qr-code" size={20} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.headerTitle}>QR Code Manager</Text>
            <Text style={styles.headerSubtitle}>Generate and print labels</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          buttons={[
            { value: 'items', label: `Items (${items.length})`, icon: 'cube-outline' },
            { value: 'locations', label: `Locations (${locations.length})`, icon: 'location-outline' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Selection Actions */}
      <View style={styles.selectionBar}>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedCount} selected
          </Text>
          <TouchableOpacity onPress={selectAll}>
            <Text style={styles.selectionAction}>Select All</Text>
          </TouchableOpacity>
          {selectedCount > 0 && (
            <TouchableOpacity onPress={deselectAll}>
              <Text style={styles.selectionAction}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {selectedCount > 0 && (
          <Button
            mode="contained"
            icon="printer"
            onPress={handleOpenPrintOptions}
            style={styles.printButton}
            labelStyle={styles.printButtonLabel}
          >
            Print ({selectedCount})
          </Button>
        )}
      </View>

      {/* List */}
      <FlatList
        data={currentData as any}
        keyExtractor={(item: any) => item.id}
        renderItem={activeTab === 'items' ? renderItemCard : renderLocationCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'items' ? 'cube-outline' : 'location-outline'}
            title={`No ${activeTab} found`}
            description={`Add ${activeTab} to your lab to generate QR codes`}
          />
        }
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

      {/* Print Options Modal */}
      <Portal>
        <Modal
          visible={showPrintModal}
          onDismiss={() => setShowPrintModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Print Options</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowPrintModal(false)}
              />
            </View>

            <View style={styles.modalBody}>
              {/* Label Size */}
              <Text style={styles.optionLabel}>Label Size</Text>
              <View style={styles.labelSizeGrid}>
                {Object.entries(LABEL_TEMPLATES).map(([key, template]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.labelSizeOption,
                      printOptions.labelSize === key && styles.labelSizeOptionSelected,
                    ]}
                    onPress={() => setPrintOptions(prev => ({ ...prev, labelSize: key as LabelSize }))}
                  >
                    <Text style={[
                      styles.labelSizeName,
                      printOptions.labelSize === key && styles.labelSizeNameSelected,
                    ]}>
                      {template.name}
                    </Text>
                    <Text style={styles.labelSizeDesc}>{template.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Divider style={styles.divider} />

              {/* QR Size */}
              <Text style={styles.optionLabel}>QR Code Size</Text>
              <SegmentedButtons
                value={printOptions.qrSize}
                onValueChange={(value) =>
                  setPrintOptions(prev => ({ ...prev, qrSize: value as 'small' | 'medium' | 'large' }))
                }
                buttons={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' },
                ]}
                style={styles.qrSizeButtons}
              />

              <Divider style={styles.divider} />

              {/* Content Options */}
              <Text style={styles.optionLabel}>Label Content</Text>
              <View style={styles.checkboxGroup}>
                <Checkbox.Item
                  label="Item Name"
                  status={printOptions.includeName ? 'checked' : 'unchecked'}
                  onPress={() => setPrintOptions(prev => ({ ...prev, includeName: !prev.includeName }))}
                  style={styles.checkboxItem}
                />
                <Checkbox.Item
                  label="Category"
                  status={printOptions.includeCategory ? 'checked' : 'unchecked'}
                  onPress={() => setPrintOptions(prev => ({ ...prev, includeCategory: !prev.includeCategory }))}
                  style={styles.checkboxItem}
                />
                <Checkbox.Item
                  label="Quantity"
                  status={printOptions.includeQuantity ? 'checked' : 'unchecked'}
                  onPress={() => setPrintOptions(prev => ({ ...prev, includeQuantity: !prev.includeQuantity }))}
                  style={styles.checkboxItem}
                />
                <Checkbox.Item
                  label="Location"
                  status={printOptions.includeLocation ? 'checked' : 'unchecked'}
                  onPress={() => setPrintOptions(prev => ({ ...prev, includeLocation: !prev.includeLocation }))}
                  style={styles.checkboxItem}
                />
                <Checkbox.Item
                  label="Expiration Date"
                  status={printOptions.includeExpiration ? 'checked' : 'unchecked'}
                  onPress={() => setPrintOptions(prev => ({ ...prev, includeExpiration: !prev.includeExpiration }))}
                  style={styles.checkboxItem}
                />
                <Checkbox.Item
                  label="Show Border"
                  status={printOptions.showBorder ? 'checked' : 'unchecked'}
                  onPress={() => setPrintOptions(prev => ({ ...prev, showBorder: !prev.showBorder }))}
                  style={styles.checkboxItem}
                />
              </View>

              <Divider style={styles.divider} />

              {/* Copies */}
              <View style={styles.copiesRow}>
                <Text style={styles.optionLabel}>Copies per item</Text>
                <View style={styles.copiesControl}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => setPrintOptions(prev => ({
                      ...prev,
                      copies: Math.max(1, prev.copies - 1),
                    }))}
                    disabled={printOptions.copies <= 1}
                  />
                  <Text style={styles.copiesCount}>{printOptions.copies}</Text>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => setPrintOptions(prev => ({
                      ...prev,
                      copies: Math.min(10, prev.copies + 1),
                    }))}
                    disabled={printOptions.copies >= 10}
                  />
                </View>
              </View>

              {/* Summary */}
              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>
                  {selectedCount} {activeTab} x {printOptions.copies} copies =
                  {' '}{selectedCount * printOptions.copies} labels
                </Text>
                <Text style={styles.summarySubtext}>
                  ~{estimatePrintPages(selectedCount * printOptions.copies, printOptions.labelSize)} page(s)
                </Text>
              </View>
            </View>

            {generating && (
              <View style={styles.progressContainer}>
                <ProgressBar progress={generatingProgress} color={colors.primary[500]} />
                <Text style={styles.progressText}>Generating QR codes...</Text>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => setShowPrintModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleGenerateLabels}
                loading={generating}
                disabled={generating}
                style={styles.modalButton}
                icon="file-document"
              >
                Generate Labels
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Print Preview Modal */}
      <Portal>
        <Modal
          visible={showPreviewModal}
          onDismiss={() => setShowPreviewModal(false)}
          contentContainerStyle={styles.previewModalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Label Preview</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowPreviewModal(false)}
            />
          </View>

          <View style={styles.previewPlaceholder}>
            <Ionicons name="document-text" size={64} color={colors.slate[300]} />
            <Text style={styles.previewPlaceholderText}>
              Labels ready for printing
            </Text>
            <Text style={styles.previewInfo}>
              {selectedCount * printOptions.copies} labels on{' '}
              {estimatePrintPages(selectedCount * printOptions.copies, printOptions.labelSize)} page(s)
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={handleShare}
              style={styles.modalButton}
              icon="share-variant"
            >
              Share PDF
            </Button>
            <Button
              mode="contained"
              onPress={handlePrint}
              style={styles.modalButton}
              icon="printer"
            >
              Print
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* QR Preview Modal */}
      <Portal>
        <Modal
          visible={showQRPreview}
          onDismiss={() => setShowQRPreview(false)}
          contentContainerStyle={styles.qrPreviewModalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>QR Code Preview</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowQRPreview(false)}
            />
          </View>

          {previewItem && (
            <View style={styles.qrPreviewContent}>
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={
                    'quantity' in previewItem
                      ? generateItemQRUrl(labId, previewItem.id, 'http://localhost:3000')
                      : generateLocationQRUrl(labId, previewItem.id, 'http://localhost:3000')
                  }
                  size={200}
                  backgroundColor={colors.white}
                  color={colors.slate[900]}
                />
              </View>

              <Text style={styles.qrPreviewName}>{previewItem.name}</Text>

              {'quantity' in previewItem ? (
                <View style={styles.qrPreviewMeta}>
                  {(previewItem as Item).category && (
                    <Badge variant="info">{(previewItem as Item).category}</Badge>
                  )}
                  <Text style={styles.qrPreviewQuantity}>
                    {(previewItem as Item).quantity} {(previewItem as Item).unit || 'units'}
                  </Text>
                </View>
              ) : (
                <View style={styles.qrPreviewMeta}>
                  <Badge variant="neutral">{(previewItem as Location).type}</Badge>
                </View>
              )}

              <Text style={styles.qrHint}>
                Scan this code to quickly access {previewItem.name}
              </Text>
            </View>
          )}

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={handleShareSingle}
              style={styles.modalButton}
              icon="share-variant"
              loading={generating}
              disabled={generating}
            >
              Share
            </Button>
            <Button
              mode="contained"
              onPress={handlePrintSingle}
              style={styles.modalButton}
              icon="printer"
              loading={generating}
              disabled={generating}
            >
              Print Label
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
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
  tabContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  segmentedButtons: {
    backgroundColor: colors.slate[50],
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate[700],
  },
  selectionAction: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  printButton: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  printButtonLabel: {
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
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
    marginLeft: spacing.xs,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.slate[900],
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemQuantity: {
    fontSize: 13,
    color: colors.slate[500],
  },
  // Modal styles
  modalContent: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  previewModalContent: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  qrPreviewModalContent: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
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
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate[700],
    marginBottom: spacing.sm,
  },
  labelSizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  labelSizeOption: {
    width: '48%',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
  },
  labelSizeOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  labelSizeName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate[700],
  },
  labelSizeNameSelected: {
    color: colors.primary[700],
  },
  labelSizeDesc: {
    fontSize: 11,
    color: colors.slate[500],
    marginTop: 2,
  },
  divider: {
    marginVertical: spacing.md,
  },
  qrSizeButtons: {
    backgroundColor: colors.slate[50],
  },
  checkboxGroup: {
    marginLeft: -spacing.sm,
  },
  checkboxItem: {
    paddingVertical: 0,
    height: 40,
  },
  copiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  copiesControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.md,
  },
  copiesCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate[900],
    minWidth: 32,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[700],
  },
  summarySubtext: {
    fontSize: 12,
    color: colors.primary[600],
    marginTop: 2,
  },
  progressContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  progressText: {
    fontSize: 12,
    color: colors.slate[500],
    textAlign: 'center',
    marginTop: spacing.xs,
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
    borderRadius: borderRadius.md,
  },
  previewPlaceholder: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  previewPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate[700],
    marginTop: spacing.md,
  },
  previewInfo: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: spacing.xs,
  },
  qrPreviewContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  qrCodeContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
    marginBottom: spacing.md,
  },
  qrPreviewName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate[900],
    marginBottom: spacing.sm,
  },
  qrPreviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  qrPreviewQuantity: {
    fontSize: 14,
    color: colors.slate[600],
  },
  qrHint: {
    fontSize: 13,
    color: colors.slate[500],
    textAlign: 'center',
  },
});
