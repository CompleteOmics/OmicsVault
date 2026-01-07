import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../../services/api';
import { Location, ItemFormData, RootStackParamList } from '../../types';
import { Card, LoadingSpinner } from '../../components/common';
import { colors, spacing, borderRadius } from '../../utils/theme';
import { format } from 'date-fns';

type ItemCreateScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ItemCreate'>;
  route: RouteProp<RootStackParamList, 'ItemCreate'>;
};

export function ItemCreateScreen({ navigation, route }: ItemCreateScreenProps) {
  const { labId } = route.params;
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    category: '',
    vendor: '',
    catalogNumber: '',
    lotNumber: '',
    quantity: '',
    unit: '',
    minQuantity: '',
    locationId: '',
    remarks: '',
    expirationDate: '',
    openedDate: '',
  });

  const [showExpirationPicker, setShowExpirationPicker] = useState(false);
  const [showOpenedPicker, setShowOpenedPicker] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      const data = await apiService.getLocations(labId);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const updateField = (field: keyof ItemFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Item name is required');
      return;
    }

    if (!formData.quantity) {
      setError('Quantity is required');
      return;
    }

    if (!formData.locationId) {
      setError('Location is required');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const newItem = await apiService.createItem(labId, formData);
      navigation.replace('ItemDetail', { labId, itemId: newItem.id });
    } catch (err) {
      console.error('Error creating item:', err);
      setError('Failed to create item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getLocationLabel = (location: Location): string => {
    const parts: string[] = [];
    let current: Location | undefined = location;
    while (current) {
      parts.unshift(current.name);
      const parent = locations.find((l) => l.id === current?.parentId);
      current = parent;
    }
    return parts.join(' > ');
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Ionicons name="cube" size={20} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Add New Item</Text>
            <Text style={styles.headerSubtitle}>Add an item to your inventory</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error Alert */}
          {error ? (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={20} color={colors.danger[600]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Basic Information */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={20} color={colors.slate[600]} />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                mode="outlined"
                value={formData.name}
                onChangeText={(v) => updateField('name', v)}
                placeholder="e.g., SYBR Green Master Mix"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  mode="outlined"
                  value={formData.category}
                  onChangeText={(v) => updateField('category', v)}
                  placeholder="e.g., Reagent"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  outlineColor={colors.slate[200]}
                  activeOutlineColor={colors.primary[500]}
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1, styles.ml]}>
                <Text style={styles.label}>Vendor</Text>
                <TextInput
                  mode="outlined"
                  value={formData.vendor}
                  onChangeText={(v) => updateField('vendor', v)}
                  placeholder="e.g., Thermo Fisher"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  outlineColor={colors.slate[200]}
                  activeOutlineColor={colors.primary[500]}
                />
              </View>
            </View>
          </Card>

          {/* Identification */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="barcode" size={20} color={colors.slate[600]} />
              <Text style={styles.sectionTitle}>Identification</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Catalog Number</Text>
                <TextInput
                  mode="outlined"
                  value={formData.catalogNumber}
                  onChangeText={(v) => updateField('catalogNumber', v)}
                  placeholder="e.g., A25741"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  outlineColor={colors.slate[200]}
                  activeOutlineColor={colors.primary[500]}
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1, styles.ml]}>
                <Text style={styles.label}>Lot Number</Text>
                <TextInput
                  mode="outlined"
                  value={formData.lotNumber}
                  onChangeText={(v) => updateField('lotNumber', v)}
                  placeholder="e.g., 2024-01-001"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  outlineColor={colors.slate[200]}
                  activeOutlineColor={colors.primary[500]}
                />
              </View>
            </View>
          </Card>

          {/* Quantity & Location */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flask" size={20} color={colors.slate[600]} />
              <Text style={styles.sectionTitle}>Quantity & Location</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  mode="outlined"
                  value={formData.quantity}
                  onChangeText={(v) => updateField('quantity', v)}
                  placeholder="0"
                  keyboardType="numeric"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  outlineColor={colors.slate[200]}
                  activeOutlineColor={colors.primary[500]}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }, styles.ml]}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  mode="outlined"
                  value={formData.unit}
                  onChangeText={(v) => updateField('unit', v)}
                  placeholder="mL"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  outlineColor={colors.slate[200]}
                  activeOutlineColor={colors.primary[500]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Minimum Quantity (Low Stock Alert)</Text>
              <TextInput
                mode="outlined"
                value={formData.minQuantity}
                onChangeText={(v) => updateField('minQuantity', v)}
                placeholder="Optional threshold"
                keyboardType="numeric"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
              <Text style={styles.hint}>
                You'll be alerted when quantity falls below this level
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.locationId}
                  onValueChange={(v) => updateField('locationId', v)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a location" value="" />
                  {locations.map((loc) => (
                    <Picker.Item
                      key={loc.id}
                      label={getLocationLabel(loc)}
                      value={loc.id}
                    />
                  ))}
                </Picker>
              </View>
              {locations.length === 0 && (
                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={16} color={colors.warning[600]} />
                  <Text style={styles.warningText}>
                    No locations found. Please create a location first.
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Expiration Tracking */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color={colors.slate[600]} />
              <Text style={styles.sectionTitle}>Expiration Tracking</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Expiration Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowExpirationPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.slate[400]} />
                  <Text
                    style={[
                      styles.dateButtonText,
                      !formData.expirationDate && styles.dateButtonPlaceholder,
                    ]}
                  >
                    {formData.expirationDate
                      ? format(new Date(formData.expirationDate), 'MMM d, yyyy')
                      : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, styles.flex1, styles.ml]}>
                <Text style={styles.label}>Opened Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowOpenedPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.slate[400]} />
                  <Text
                    style={[
                      styles.dateButtonText,
                      !formData.openedDate && styles.dateButtonPlaceholder,
                    ]}
                  >
                    {formData.openedDate
                      ? format(new Date(formData.openedDate), 'MMM d, yyyy')
                      : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.expirationDate && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={colors.primary[600]} />
                <Text style={styles.infoText}>
                  Your team will be notified 30 days and 7 days before expiration.
                </Text>
              </View>
            )}
          </Card>

          {/* Notes */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={colors.slate[600]} />
              <Text style={styles.sectionTitle}>Additional Notes</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                mode="outlined"
                value={formData.remarks}
                onChangeText={(v) => updateField('remarks', v)}
                placeholder="Storage conditions, handling instructions..."
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting || locations.length === 0}
              style={styles.submitButton}
              labelStyle={styles.submitButtonLabel}
              icon="check"
            >
              Create Item
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showExpirationPicker && (
        <DateTimePicker
          value={formData.expirationDate ? new Date(formData.expirationDate) : new Date()}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowExpirationPicker(false);
            if (date) {
              updateField('expirationDate', date.toISOString());
            }
          }}
        />
      )}

      {showOpenedPicker && (
        <DateTimePicker
          value={formData.openedDate ? new Date(formData.openedDate) : new Date()}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            setShowOpenedPicker(false);
            if (date) {
              updateField('openedDate', date.toISOString());
            }
          }}
        />
      )}
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger[50],
    borderWidth: 1,
    borderColor: colors.danger[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.sm,
    color: colors.danger[700],
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate[900],
    marginLeft: spacing.sm,
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
  textArea: {
    minHeight: 100,
  },
  inputOutline: {
    borderRadius: borderRadius.md,
  },
  hint: {
    fontSize: 12,
    color: colors.slate[500],
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  ml: {
    marginLeft: spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  warningText: {
    marginLeft: spacing.sm,
    color: colors.warning[700],
    fontSize: 13,
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateButtonText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.slate[900],
  },
  dateButtonPlaceholder: {
    color: colors.slate[400],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoText: {
    marginLeft: spacing.sm,
    color: colors.primary[700],
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.slate[300],
  },
  cancelButtonLabel: {
    color: colors.slate[700],
  },
  submitButton: {
    flex: 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  submitButtonLabel: {
    fontWeight: '600',
  },
});
