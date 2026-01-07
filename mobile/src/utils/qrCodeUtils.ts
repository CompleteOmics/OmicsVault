/**
 * QR Code Utilities for OmicsVault Lab Inventory
 *
 * Comprehensive QR code generation, label templates, and printing utilities
 * for professional lab inventory management.
 */

import { Item, Location } from '../types';
import { colors } from './theme';
import { format } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export type LabelSize = 'avery5160' | 'avery5161' | 'avery5163' | 'dymo30252' | 'dymo30336' | 'custom';

export interface LabelTemplate {
  name: string;
  description: string;
  width: number;  // in mm
  height: number; // in mm
  columns: number;
  rows: number;
  marginTop: number;
  marginLeft: number;
  horizontalGap: number;
  verticalGap: number;
  pageWidth: number;  // in mm (letter = 215.9mm)
  pageHeight: number; // in mm (letter = 279.4mm)
}

export interface QRCodeData {
  type: 'item' | 'location' | 'batch' | 'share';
  id: string;
  labId: string;
  name: string;
  metadata?: Record<string, any>;
}

export interface PrintOptions {
  labelSize: LabelSize;
  copies: number;
  includeName: boolean;
  includeLocation: boolean;
  includeQuantity: boolean;
  includeExpiration: boolean;
  includeCategory: boolean;
  showBorder: boolean;
  qrSize: 'small' | 'medium' | 'large';
}

// ============================================================================
// LABEL TEMPLATES
// ============================================================================

export const LABEL_TEMPLATES: Record<LabelSize, LabelTemplate> = {
  avery5160: {
    name: 'Avery 5160',
    description: 'Standard address labels (1" x 2-5/8")',
    width: 66.7,
    height: 25.4,
    columns: 3,
    rows: 10,
    marginTop: 12.7,
    marginLeft: 4.8,
    horizontalGap: 3.2,
    verticalGap: 0,
    pageWidth: 215.9,
    pageHeight: 279.4,
  },
  avery5161: {
    name: 'Avery 5161',
    description: 'Easy Peel labels (1" x 4")',
    width: 101.6,
    height: 25.4,
    columns: 2,
    rows: 10,
    marginTop: 12.7,
    marginLeft: 4.8,
    horizontalGap: 4.8,
    verticalGap: 0,
    pageWidth: 215.9,
    pageHeight: 279.4,
  },
  avery5163: {
    name: 'Avery 5163',
    description: 'Shipping labels (2" x 4")',
    width: 101.6,
    height: 50.8,
    columns: 2,
    rows: 5,
    marginTop: 12.7,
    marginLeft: 4.8,
    horizontalGap: 4.8,
    verticalGap: 0,
    pageWidth: 215.9,
    pageHeight: 279.4,
  },
  dymo30252: {
    name: 'DYMO 30252',
    description: 'Address labels (1-1/8" x 3-1/2")',
    width: 89,
    height: 28,
    columns: 1,
    rows: 1,
    marginTop: 0,
    marginLeft: 0,
    horizontalGap: 0,
    verticalGap: 3.2,
    pageWidth: 89,
    pageHeight: 28,
  },
  dymo30336: {
    name: 'DYMO 30336',
    description: 'Small multipurpose (1" x 2-1/8")',
    width: 54,
    height: 25,
    columns: 1,
    rows: 1,
    marginTop: 0,
    marginLeft: 0,
    horizontalGap: 0,
    verticalGap: 2,
    pageWidth: 54,
    pageHeight: 25,
  },
  custom: {
    name: 'Custom',
    description: 'Custom label size',
    width: 50,
    height: 25,
    columns: 4,
    rows: 10,
    marginTop: 10,
    marginLeft: 10,
    horizontalGap: 5,
    verticalGap: 5,
    pageWidth: 215.9,
    pageHeight: 279.4,
  },
};

// ============================================================================
// QR CODE URL GENERATORS
// ============================================================================

/**
 * Generate a QR code URL for an item
 */
export function generateItemQRUrl(labId: string, itemId: string, appUrl: string): string {
  return `${appUrl}/labs/${labId}/items/${itemId}`;
}

/**
 * Generate a QR code URL for a location
 */
export function generateLocationQRUrl(labId: string, locationId: string, appUrl: string): string {
  return `${appUrl}/labs/${labId}/locations/${locationId}`;
}

/**
 * Generate a deep link for the mobile app
 */
export function generateDeepLink(type: 'item' | 'location', labId: string, id: string): string {
  return `omicsvault://${type}/${labId}/${id}`;
}

/**
 * Generate offline-capable QR data that embeds item metadata
 */
export function generateOfflineQRData(item: Item): string {
  const data: QRCodeData = {
    type: 'item',
    id: item.id,
    labId: item.labId,
    name: item.name,
    metadata: {
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      location: item.location?.name,
      vendor: item.vendor,
      catalogNumber: item.catalogNumber,
      expirationDate: item.expirationDate,
    },
  };
  return JSON.stringify(data);
}

/**
 * Generate shareable QR data with timestamp for collaboration
 */
export function generateShareableQRData(item: Item, sharedBy: string): string {
  const data = {
    type: 'share',
    id: item.id,
    labId: item.labId,
    name: item.name,
    sharedBy,
    sharedAt: new Date().toISOString(),
    metadata: {
      category: item.category,
      quantity: item.quantity,
      vendor: item.vendor,
    },
  };
  return JSON.stringify(data);
}

// ============================================================================
// HTML LABEL GENERATION
// ============================================================================

/**
 * Generate HTML for a single item label
 */
export function generateItemLabelHTML(
  item: Item,
  qrDataUrl: string,
  options: PrintOptions
): string {
  const qrSizes = { small: 40, medium: 60, large: 80 };
  const qrSize = qrSizes[options.qrSize];

  const expirationText = item.expirationDate
    ? format(new Date(item.expirationDate), 'MMM d, yyyy')
    : '';

  const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();
  const isExpiringSoon = item.expirationDate &&
    new Date(item.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const borderStyle = options.showBorder
    ? `border: 1px solid ${colors.slate[200]}; border-radius: 4px;`
    : '';

  const expirationColor = isExpired
    ? colors.danger[600]
    : isExpiringSoon
      ? colors.warning[600]
      : colors.slate[600];

  return `
    <div style="
      display: flex;
      align-items: center;
      padding: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      ${borderStyle}
      height: 100%;
      box-sizing: border-box;
    ">
      <img
        src="${qrDataUrl}"
        style="width: ${qrSize}px; height: ${qrSize}px; margin-right: 8px; flex-shrink: 0;"
      />
      <div style="flex: 1; min-width: 0; overflow: hidden;">
        ${options.includeName ? `
          <div style="
            font-size: 11px;
            font-weight: 700;
            color: ${colors.slate[900]};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
          ">${escapeHtml(item.name)}</div>
        ` : ''}
        ${options.includeCategory && item.category ? `
          <div style="
            font-size: 8px;
            color: ${colors.primary[600]};
            background: ${colors.primary[50]};
            padding: 1px 4px;
            border-radius: 2px;
            display: inline-block;
            margin-bottom: 2px;
          ">${escapeHtml(item.category)}</div>
        ` : ''}
        ${options.includeQuantity ? `
          <div style="
            font-size: 9px;
            color: ${colors.slate[700]};
          ">Qty: ${item.quantity} ${item.unit || 'units'}</div>
        ` : ''}
        ${options.includeLocation && item.location ? `
          <div style="
            font-size: 8px;
            color: ${colors.slate[500]};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${escapeHtml(item.location.name)}</div>
        ` : ''}
        ${options.includeExpiration && item.expirationDate ? `
          <div style="
            font-size: 8px;
            color: ${expirationColor};
            font-weight: ${isExpired || isExpiringSoon ? '600' : '400'};
          ">Exp: ${expirationText}</div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Generate HTML for a location label
 */
export function generateLocationLabelHTML(
  location: Location,
  qrDataUrl: string,
  options: PrintOptions
): string {
  const qrSizes = { small: 40, medium: 60, large: 80 };
  const qrSize = qrSizes[options.qrSize];

  const borderStyle = options.showBorder
    ? `border: 1px solid ${colors.slate[200]}; border-radius: 4px;`
    : '';

  return `
    <div style="
      display: flex;
      align-items: center;
      padding: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      ${borderStyle}
      height: 100%;
      box-sizing: border-box;
    ">
      <img
        src="${qrDataUrl}"
        style="width: ${qrSize}px; height: ${qrSize}px; margin-right: 8px; flex-shrink: 0;"
      />
      <div style="flex: 1; min-width: 0; overflow: hidden;">
        <div style="
          font-size: 11px;
          font-weight: 700;
          color: ${colors.slate[900]};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        ">${escapeHtml(location.name)}</div>
        <div style="
          font-size: 8px;
          color: ${colors.primary[600]};
          background: ${colors.primary[50]};
          padding: 1px 4px;
          border-radius: 2px;
          display: inline-block;
          margin-bottom: 2px;
        ">${escapeHtml(location.type)}</div>
        ${location.description ? `
          <div style="
            font-size: 8px;
            color: ${colors.slate[500]};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${escapeHtml(location.description)}</div>
        ` : ''}
        ${location._count?.items !== undefined ? `
          <div style="
            font-size: 9px;
            color: ${colors.slate[600]};
          ">${location._count.items} items</div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Generate a full label sheet HTML for batch printing
 */
export function generateLabelSheetHTML(
  labels: string[],
  template: LabelTemplate
): string {
  const { columns, rows, marginTop, marginLeft, horizontalGap, verticalGap, width, height, pageWidth, pageHeight } = template;
  const labelsPerPage = columns * rows;
  const totalPages = Math.ceil(labels.length / labelsPerPage);

  const pages: string[] = [];

  for (let page = 0; page < totalPages; page++) {
    const startIdx = page * labelsPerPage;
    const pageLabels = labels.slice(startIdx, startIdx + labelsPerPage);

    let gridContent = '';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const idx = row * columns + col;
        const label = pageLabels[idx] || '';
        const left = marginLeft + col * (width + horizontalGap);
        const top = marginTop + row * (height + verticalGap);

        gridContent += `
          <div style="
            position: absolute;
            left: ${left}mm;
            top: ${top}mm;
            width: ${width}mm;
            height: ${height}mm;
            overflow: hidden;
          ">${label}</div>
        `;
      }
    }

    pages.push(`
      <div style="
        position: relative;
        width: ${pageWidth}mm;
        height: ${pageHeight}mm;
        page-break-after: ${page < totalPages - 1 ? 'always' : 'auto'};
      ">
        ${gridContent}
      </div>
    `);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>OmicsVault Labels</title>
      <style>
        @page {
          size: ${pageWidth}mm ${pageHeight}mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${pages.join('')}
    </body>
    </html>
  `;
}

/**
 * Generate a single label print preview HTML
 */
export function generateSingleLabelPreviewHTML(labelContent: string, width: number, height: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Label Preview</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          background: #f0f0f0;
          box-sizing: border-box;
        }
        .label-container {
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          width: ${width}mm;
          height: ${height}mm;
        }
        @media print {
          body { background: white; padding: 0; }
          .label-container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="label-container">
        ${labelContent}
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// QUICK ACTION QR GENERATION
// ============================================================================

/**
 * Quick action types for QR scanning
 */
export type QuickActionType =
  | 'view'
  | 'update_quantity'
  | 'move'
  | 'mark_used'
  | 'log_usage'
  | 'check_status';

export interface QuickActionQRData {
  action: QuickActionType;
  type: 'item' | 'location';
  id: string;
  labId: string;
  timestamp: string;
}

/**
 * Generate QR data for quick actions
 */
export function generateQuickActionQR(
  action: QuickActionType,
  type: 'item' | 'location',
  id: string,
  labId: string
): string {
  const data: QuickActionQRData = {
    action,
    type,
    id,
    labId,
    timestamp: new Date().toISOString(),
  };
  return JSON.stringify(data);
}

/**
 * Parse scanned QR code data
 */
export function parseQRCodeData(data: string): QRCodeData | QuickActionQRData | { url: string } | null {
  try {
    // Try parsing as JSON (offline/quick action data)
    const parsed = JSON.parse(data);
    return parsed;
  } catch {
    // Check if it's a URL
    try {
      const url = new URL(data);

      // Check for OmicsVault deep links
      if (url.protocol === 'omicsvault:') {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 3) {
          return {
            type: parts[0] as 'item' | 'location',
            labId: parts[1],
            id: parts[2],
            name: '',
          };
        }
      }

      // Check for web URLs
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.includes('labs') && (pathParts.includes('items') || pathParts.includes('locations'))) {
        const labIdx = pathParts.indexOf('labs');
        const labId = pathParts[labIdx + 1];
        const isItem = pathParts.includes('items');
        const typeIdx = pathParts.indexOf(isItem ? 'items' : 'locations');
        const id = pathParts[typeIdx + 1];

        if (labId && id) {
          return {
            type: isItem ? 'item' : 'location',
            labId,
            id,
            name: '',
          };
        }
      }

      return { url: data };
    } catch {
      return null;
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Get default print options
 */
export function getDefaultPrintOptions(): PrintOptions {
  return {
    labelSize: 'avery5160',
    copies: 1,
    includeName: true,
    includeLocation: true,
    includeQuantity: true,
    includeExpiration: true,
    includeCategory: true,
    showBorder: true,
    qrSize: 'medium',
  };
}

/**
 * Calculate how many labels fit on a page
 */
export function getLabelsPerPage(labelSize: LabelSize): number {
  const template = LABEL_TEMPLATES[labelSize];
  return template.columns * template.rows;
}

/**
 * Estimate print pages needed
 */
export function estimatePrintPages(labelCount: number, labelSize: LabelSize): number {
  const labelsPerPage = getLabelsPerPage(labelSize);
  return Math.ceil(labelCount / labelsPerPage);
}
