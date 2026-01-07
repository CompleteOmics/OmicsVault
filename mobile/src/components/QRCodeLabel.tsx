import React, { useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Portal, Modal, IconButton } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, borderRadius } from '../utils/theme';
import { Item, Location } from '../types';

// Note: expo-print and expo-sharing have been temporarily removed due to native module linking issues.
// Users can screenshot the QR code for now. To re-enable printing:
// 1. Run: npx expo prebuild --clean
// 2. Run: cd ios && pod install
// 3. Rebuild the app: npx expo run:ios

interface QRCodeLabelProps {
  item?: Item;
  location?: Location;
  labId: string;
  visible: boolean;
  onDismiss: () => void;
}

export function QRCodeLabel({ item, location, labId, visible, onDismiss }: QRCodeLabelProps) {
  const qrRef = useRef<any>(null);

  const generateURL = () => {
    if (item) {
      return `omicsvault://labs/${labId}/items/${item.id}`;
    } else if (location) {
      return `omicsvault://labs/${labId}/locations/${location.id}`;
    }
    return '';
  };

  const handleScreenshotHint = () => {
    Alert.alert(
      'Save QR Code',
      'To save this QR code, take a screenshot:\n\n' +
      'iPhone: Press Side Button + Volume Up\n' +
      'iPad: Press Top Button + Volume Up\n\n' +
      'The screenshot will be saved to your Photos.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const url = generateURL();
  const name = item?.name || location?.name || 'Unknown';

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>QR Code Label</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>

          {item && (
            <View style={styles.itemDetails}>
              <Text style={styles.detailText}>Category: {item.category || 'N/A'}</Text>
              <Text style={styles.detailText}>Vendor: {item.vendor || 'N/A'}</Text>
              <Text style={styles.detailText}>Catalog #: {item.catalogNumber || 'N/A'}</Text>
              {item.quantity && (
                <Text style={styles.detailText}>
                  Quantity: {item.quantity} {item.unit || ''}
                </Text>
              )}
            </View>
          )}

          {location && (
            <View style={styles.itemDetails}>
              <Text style={styles.detailText}>Type: {location.type}</Text>
              {location.description && (
                <Text style={styles.detailText}>Description: {location.description}</Text>
              )}
            </View>
          )}

          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={url}
                size={200}
                backgroundColor="white"
                color="black"
                getRef={(ref) => (qrRef.current = ref)}
              />
            </View>
          </View>

          <Text style={styles.urlText}>{url}</Text>

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleScreenshotHint}
              style={styles.saveButton}
              icon="camera"
            >
              How to Save
            </Button>
            <Text style={styles.hintText}>
              Take a screenshot to save this QR code
            </Text>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate[900],
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.slate[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  itemDetails: {
    width: '100%',
    backgroundColor: colors.slate[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  detailText: {
    fontSize: 14,
    color: colors.slate[700],
    marginBottom: spacing.xs,
  },
  qrContainer: {
    marginVertical: spacing.lg,
    alignItems: 'center',
  },
  qrWrapper: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.slate[200],
  },
  urlText: {
    fontSize: 10,
    color: colors.slate[500],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary[500],
  },
  hintText: {
    fontSize: 12,
    color: colors.slate[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
