import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import apiService from '../../services/api';
import { Location, RootStackParamList } from '../../types';
import { Card, LoadingSpinner } from '../../components/common';
import { colors, spacing, borderRadius } from '../../utils/theme';

type LocationCreateScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LocationCreate'>;
  route: RouteProp<RootStackParamList, 'LocationCreate'>;
};

const LOCATION_TYPES = [
  'Room',
  'Freezer',
  'Refrigerator',
  'Cabinet',
  'Shelf',
  'Rack',
  'Box',
  'Drawer',
];

export function LocationCreateScreen({ navigation, route }: LocationCreateScreenProps) {
  const { labId, parentId } = route.params;
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(parentId || '');

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Location name is required');
      return;
    }

    if (!type) {
      setError('Location type is required');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await apiService.createLocation(labId, {
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        parentId: selectedParentId || undefined,
      });
      navigation.goBack();
    } catch (err) {
      console.error('Error creating location:', err);
      setError('Failed to create location. Please try again.');
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
            <Ionicons name="location" size={20} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Add New Location</Text>
            <Text style={styles.headerSubtitle}>Create a location to organize items</Text>
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

          {/* Location Information */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color={colors.slate[600]} />
              <Text style={styles.sectionTitle}>Location Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Name *</Text>
              <TextInput
                mode="outlined"
                value={name}
                onChangeText={setName}
                placeholder="e.g., Main Freezer, Lab Room 101"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Type *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={type}
                  onValueChange={setType}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a type" value="" />
                  {LOCATION_TYPES.map((locType) => (
                    <Picker.Item key={locType} label={locType} value={locType} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.hint}>
                Choose the type that best describes this location
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent Location (optional)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedParentId}
                  onValueChange={setSelectedParentId}
                  style={styles.picker}
                >
                  <Picker.Item label="None (Top-level location)" value="" />
                  {locations.map((loc) => (
                    <Picker.Item
                      key={loc.id}
                      label={getLocationLabel(loc)}
                      value={loc.id}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={styles.hint}>
                Nest this location inside another to create a hierarchy
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                mode="outlined"
                value={description}
                onChangeText={setDescription}
                placeholder="Additional details about this location..."
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>
          </Card>

          {/* Location Type Guide */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-circle" size={20} color={colors.slate[600]} />
              <Text style={styles.sectionTitle}>Location Type Guide</Text>
            </View>

            <View style={styles.typeGuide}>
              <View style={styles.typeItem}>
                <View style={[styles.typeIcon, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name="business" size={16} color={colors.primary[600]} />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Room</Text>
                  <Text style={styles.typeDescription}>A physical room or area</Text>
                </View>
              </View>

              <View style={styles.typeItem}>
                <View style={[styles.typeIcon, { backgroundColor: colors.slate[100] }]}>
                  <Ionicons name="snow" size={16} color={colors.slate[600]} />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Freezer / Refrigerator</Text>
                  <Text style={styles.typeDescription}>Cold storage equipment</Text>
                </View>
              </View>

              <View style={styles.typeItem}>
                <View style={[styles.typeIcon, { backgroundColor: colors.warning[50] }]}>
                  <Ionicons name="file-tray-full" size={16} color={colors.warning[600]} />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Cabinet / Shelf</Text>
                  <Text style={styles.typeDescription}>Storage furniture</Text>
                </View>
              </View>

              <View style={styles.typeItem}>
                <View style={[styles.typeIcon, { backgroundColor: colors.success[50] }]}>
                  <Ionicons name="cube" size={16} color={colors.success[600]} />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Box / Drawer / Rack</Text>
                  <Text style={styles.typeDescription}>Smaller containers</Text>
                </View>
              </View>
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
              disabled={submitting}
              style={styles.submitButton}
              labelStyle={styles.submitButtonLabel}
              icon="check"
            >
              Create Location
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    minHeight: 80,
  },
  inputOutline: {
    borderRadius: borderRadius.md,
  },
  hint: {
    fontSize: 12,
    color: colors.slate[500],
    marginTop: 4,
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
  typeGuide: {
    gap: spacing.sm,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate[900],
  },
  typeDescription: {
    fontSize: 12,
    color: colors.slate[500],
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
