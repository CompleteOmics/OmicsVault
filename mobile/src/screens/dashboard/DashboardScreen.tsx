import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, FAB, Portal, Modal, TextInput, Button, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../context/AuthContext';
import apiService from '../../services/api';
import { Lab, RootStackParamList } from '../../types';
import { Card, LoadingSpinner, EmptyState } from '../../components/common';
import { colors, spacing, borderRadius, shadows, typography } from '../../utils/theme';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

function LabCard({ lab, onPress }: { lab: Lab; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.labCard}>
      <View style={styles.labCardContent}>
        <View style={styles.labIconContainer}>
          <Ionicons name="flask" size={24} color={colors.primary[500]} />
        </View>
        <View style={styles.labInfo}>
          <Text style={styles.labName}>{lab.name}</Text>
          {lab.description && (
            <Text style={styles.labDescription} numberOfLines={2}>
              {lab.description}
            </Text>
          )}
          <View style={styles.labStats}>
            <View style={styles.labStat}>
              <Ionicons name="cube-outline" size={16} color={colors.slate[400]} />
              <Text style={styles.labStatText}>{lab._count.items} items</Text>
            </View>
            <View style={styles.labStat}>
              <Ionicons name="location-outline" size={16} color={colors.slate[400]} />
              <Text style={styles.labStatText}>{lab._count.locations} locations</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} />
      </View>
    </Card>
  );
}

function LabCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonDescription} />
        <View style={styles.skeletonStats} />
      </View>
    </View>
  );
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabDescription, setNewLabDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const { user, signOut } = useAuthStore();

  const fetchLabs = useCallback(async () => {
    try {
      const data = await apiService.getLabs();
      setLabs(data);
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLabs();
    }, [fetchLabs])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLabs();
    setRefreshing(false);
  }, [fetchLabs]);

  const handleCreateLab = async () => {
    if (!newLabName.trim()) return;

    setCreating(true);
    try {
      const newLab = await apiService.createLab({
        name: newLabName.trim(),
        description: newLabDescription.trim() || undefined,
      });
      setLabs([...labs, newLab]);
      setShowCreateModal(false);
      setNewLabName('');
      setNewLabDescription('');
      navigation.navigate('Lab', { labId: newLab.id });
    } catch (error) {
      console.error('Error creating lab:', error);
      Alert.alert('Error', 'Failed to create lab. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const renderLab = ({ item }: { item: Lab }) => (
    <LabCard
      lab={item}
      onPress={() => navigation.navigate('Lab', { labId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <Ionicons name="cube" size={24} color={colors.white} />
          </View>
          <Text style={styles.logoText}>OmicsVault</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.avatarButton}>
            <Avatar.Text
              size={40}
              label={user?.name?.[0]?.toUpperCase() || 'U'}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Page Title */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Your Labs</Text>
        <Text style={styles.pageSubtitle}>Manage and organize your laboratory inventory</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <LabCardSkeleton key={i} />
          ))}
        </View>
      ) : labs.length === 0 ? (
        <EmptyState
          icon="sparkles"
          title="Welcome to OmicsVault"
          description="Create your first lab to start organizing and tracking your inventory with powerful features designed for biotech researchers."
          actionLabel="Create Your First Lab"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <FlatList
          data={labs}
          renderItem={renderLab}
          keyExtractor={(item) => item.id}
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

      {/* FAB */}
      {!loading && labs.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          color={colors.white}
          onPress={() => setShowCreateModal(true)}
        />
      )}

      {/* Create Lab Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Lab</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} color={colors.slate[500]} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lab Name</Text>
              <TextInput
                mode="outlined"
                value={newLabName}
                onChangeText={setNewLabName}
                placeholder="e.g., Genomics Lab, Cell Culture Room"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                mode="outlined"
                value={newLabDescription}
                onChangeText={setNewLabDescription}
                placeholder="Brief description of this lab..."
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
                outlineStyle={styles.inputOutline}
                outlineColor={colors.slate[200]}
                activeOutlineColor={colors.primary[500]}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setShowCreateModal(false)}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateLab}
              loading={creating}
              disabled={creating || !newLabName.trim()}
              style={styles.createButton}
              labelStyle={styles.createButtonLabel}
            >
              Create Lab
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate[900],
    marginLeft: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
    maxWidth: 120,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate[900],
  },
  userEmail: {
    fontSize: 12,
    color: colors.slate[500],
  },
  avatarButton: {
    borderRadius: 20,
  },
  avatar: {
    backgroundColor: colors.primary[500],
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.slate[900],
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: 4,
  },
  loadingContainer: {
    padding: spacing.lg,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  labCard: {
    marginBottom: spacing.md,
  },
  labCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  labInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  labName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate[900],
    marginBottom: 2,
  },
  labDescription: {
    fontSize: 13,
    color: colors.slate[500],
    marginBottom: spacing.sm,
  },
  labStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  labStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labStatText: {
    fontSize: 12,
    color: colors.slate[500],
    marginLeft: 4,
  },
  skeletonCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.slate[200],
    marginRight: spacing.md,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    width: '60%',
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.slate[200],
    marginBottom: spacing.sm,
  },
  skeletonDescription: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    backgroundColor: colors.slate[200],
    marginBottom: spacing.sm,
  },
  skeletonStats: {
    width: '40%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.slate[200],
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
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
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.slate[300],
  },
  cancelButtonLabel: {
    color: colors.slate[700],
  },
  createButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  createButtonLabel: {
    fontWeight: '600',
  },
});
