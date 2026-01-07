# OmicsVault Features

Comprehensive guide to all features in OmicsVault.

## 1. Lab Workspaces & Roles

### Multi-Lab Support
- Users can be members of multiple labs
- Each lab has its own isolated inventory, locations, and activity
- Switch between labs seamlessly from the dashboard

### Role-Based Access Control
- **Admin**: Full control over lab settings, member management, and all inventory operations
- **Member**: Can add/edit items, move items, and view all lab data

### Use Cases
- Separate labs for different research groups
- Department-level organization
- Project-specific inventories

## 2. Invite-by-Link Onboarding

### Secure Invite System
- Admins generate unique invite links
- Configurable expiration dates (default: 7 days)
- Optional usage limits (single-use or multi-use)
- Track usage count per invite

### How It Works
1. Admin clicks "Settings" → "Invites" → "Generate Invite Link"
2. Set expiration and max uses
3. Share link with team members
4. New members click link and instantly join the lab

### Security Features
- Cryptographically secure tokens
- Automatic expiration
- Usage tracking and limits
- One-click revocation

## 3. Item Management

### Biotech-Specific Fields
Every item can track:
- **Name**: Item identifier (e.g., "Anti-CD3 Antibody")
- **Category**: Type of item (Antibody, Reagent, Buffer, Sample, etc.)
- **Vendor**: Supplier name (BioLegend, Sigma-Aldrich, etc.)
- **Catalog Number**: Vendor's catalog/part number
- **Lot Number**: Batch/lot number for traceability
- **Quantity**: Numeric amount with decimal support
- **Unit**: Measurement unit (µg, mL, mg, units, etc.)
- **Location**: Where the item is stored (full breadcrumb path)
- **Remarks**: Free-form notes and observations

### CRUD Operations
- **Create**: Add new items with all fields
- **Read**: View detailed item information
- **Update**: Edit any field, tracks last updater
- **Delete**: Remove items (with activity log entry)

### Audit Trail
- Every item shows who created it and when
- Displays who last updated it and timestamp
- Complete movement history
- Quantity change tracking

## 4. Nested Location System

### Hierarchical Organization
Build complex storage structures:
```
Lab Room 301
  ├─ Freezer A (-80°C)
  │   ├─ Shelf 1
  │   │   ├─ Box A1
  │   │   └─ Box A2
  │   └─ Shelf 2
  │       ├─ Box B1
  │       └─ Box B2
  └─ Refrigerator B (4°C)
      ├─ Shelf 1
      └─ Shelf 2
```

### Location Types
- Room
- Freezer
- Refrigerator
- Cabinet
- Shelf
- Rack
- Box
- Drawer

### Features
- Unlimited nesting depth
- Breadcrumb navigation (Room > Freezer > Shelf > Box)
- Item count per location
- Visual tree view
- Optional descriptions per location

## 5. Photo Gallery

### Visual Identification
- Attach multiple photos to each item
- Support for common image formats (JPG, PNG, etc.)
- Optional captions for each photo
- Thumbnail view in item lists
- Full gallery view on item detail page

### Use Cases
- Photo of physical label
- Storage box contents
- Freezer organization
- Visual verification before use
- Documentation of sample appearance

### Upload Process
1. Navigate to item detail page
2. Click "Upload Photo"
3. Select image file
4. Add optional caption
5. Photo instantly available in gallery

## 6. Movement Tracking

### Complete Audit Trail
Every movement records:
- Item being moved
- Source location
- Destination location
- Who moved it
- When it was moved
- Optional notes

### Movement History
- Chronological list on item detail page
- Shows last 10 movements by default
- Full location breadcrumbs for context
- User attribution with timestamps

### One-Tap Movement
1. Open item detail page
2. Click "Move" button
3. Select new location
4. Confirm - done!

### Activity Integration
All movements appear in the lab's activity feed for team visibility.

## 7. Search & Filters

### Fast Global Search
Search across all item fields:
- Item name
- Vendor name
- Catalog number
- Lot number

### Search Features
- Real-time, as-you-type results
- Case-insensitive matching
- Partial word matching
- Instant UI updates

### Filtering Options
- **Category Filter**: Show only specific categories
- **Location Filter**: Filter by storage location
- **Low Stock Filter**: Show only items below minimum quantity
- Combine multiple filters

### Performance
- Optimized database queries
- Fast response even with 1000+ items
- Indexed search fields

## 8. Low-Stock Alerts

### Threshold Configuration
- Set minimum quantity per item
- Optional field (leave blank to disable)
- Independent of current quantity

### Visual Indicators
- Yellow "Low Stock" badge on item cards
- Highlighted in item lists
- Dedicated "Low Stock Only" filter
- Dashboard warnings (future feature)

### Use Cases
- Proactive reordering
- Budget planning
- Avoid running out of critical reagents
- Lab manager oversight

### Alert Triggering
Alert shows when: `current quantity ≤ minimum quantity`

## 9. Activity Feed

### Real-Time Lab Timeline
See everything happening in your lab:
- Items added/updated/deleted
- Items moved between locations
- Quantity changes
- Photos added
- Locations created
- Members joined/removed

### Activity Types
Each activity shows:
- User who performed the action
- Descriptive text
- Timestamp
- Related item/location (where applicable)

### Features
- Chronological order (newest first)
- User avatars (initials)
- Pagination support
- Filterable by activity type

### Team Coordination
- Know when teammates update inventory
- Track who moved what and when
- Maintain lab accountability
- Audit compliance

## 10. QR Code Generation

### Printable Labels
- Generate QR code for any item
- Scannable with any smartphone
- Direct link to item detail page
- 300x300px high-quality image

### Workflow
1. Open item detail page
2. Click "QR Code" button
3. QR code instantly generates
4. Right-click to save image
5. Print and attach to physical item

### Use Cases
- Label freezer boxes
- Tag reagent bottles
- Shelf markers
- Quick item lookup at the bench
- Reduce search time

### Smart Links
QR codes encode full URL:
`https://your-app.com/labs/{labId}/items/{itemId}`

Scanning the code:
- Opens item details
- Shows current location
- Displays quantity
- Shows recent movements
- Access from anywhere in the lab

## Additional Features

### Responsive Design
- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Optimized for lab bench use

### Data Export
- Export items to CSV (future)
- Backup and restore (future)
- Report generation (future)

### Security
- Secure authentication (NextAuth.js)
- Session management
- Role-based access control
- Audit logging

### Performance
- Fast page loads
- Optimistic UI updates
- Efficient database queries
- Image optimization

## Coming Soon

Features in development:
- Email notifications for low stock
- Barcode scanning
- Bulk item import/export
- Custom fields per lab
- Item expiration tracking
- Usage tracking and analytics
- Integration with ordering systems
- Mobile apps (iOS/Android)

---

For questions about specific features, contact support@completeomics.com
