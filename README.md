# OmicsVault

**Professional Lab Inventory Management System**
A product of Complete Omics Inc.

OmicsVault is a comprehensive inventory management system designed specifically for biotech and research labs. Track reagents, antibodies, samples, and equipment with precision while maintaining complete visibility of your lab's inventory.

## Features

- **Lab Workspaces & Roles**: Multi-lab support with Admin/Member roles for controlled access
- **Invite-by-Link Onboarding**: Secure, one-click team member invites with expiration and usage limits
- **Biotech-Ready Item Management**: Track name, category, vendor, catalog #, lot #, quantity + unit, location, and remarks
- **Nested Location System**: Organize inventory with hierarchical locations (Room → Freezer → Shelf → Box)
- **Photo Gallery**: Attach multiple photos to items for visual identification
- **Movement Tracking**: Complete audit trail of item movements with "last updated by" information
- **Advanced Search & Filters**: Fast, instant search across all item fields with category and location filters
- **Low-Stock Alerts**: Set minimum quantity thresholds and get visual alerts in the UI
- **Activity Feed**: Real-time timeline of all lab activities
- **QR Code Labels**: Generate printable QR codes for quick item access from the bench

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd omicsvault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/omicsvault?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npx prisma db push
   ```

5. **Seed the database** (optional - creates test data)
   ```bash
   npm run db:seed
   ```

6. **Create uploads directory**
   ```bash
   mkdir -p public/uploads
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Test Credentials (if you ran seed)

- **Admin**: admin@omicsvault.com / password123
- **Researcher**: researcher@omicsvault.com / password123

## Project Structure

```
omicsvault/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── labs/         # Lab management
│   │   └── invites/      # Invite system
│   ├── auth/             # Auth pages (signin/signup)
│   ├── dashboard/        # Main dashboard
│   └── labs/             # Lab-specific pages
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── public/               # Static assets
│   └── uploads/          # Uploaded photos
└── types/                # TypeScript type definitions
```

## Database Schema

The application uses the following main models:

- **User**: System users with authentication
- **Lab**: Lab workspaces with team members
- **LabMember**: User membership in labs with roles (ADMIN/MEMBER)
- **Invite**: Secure invite links for onboarding
- **Location**: Hierarchical location system
- **Item**: Inventory items with biotech-specific fields
- **Photo**: Item photos
- **Movement**: Item movement audit trail
- **Activity**: Lab activity feed

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in (handled by NextAuth)

### Labs
- `GET /api/labs` - List user's labs
- `POST /api/labs` - Create new lab
- `GET /api/labs/[labId]/members` - List lab members
- `DELETE /api/labs/[labId]/members?userId=...` - Remove member

### Invites
- `GET /api/labs/[labId]/invites` - List invites (Admin only)
- `POST /api/labs/[labId]/invites` - Create invite (Admin only)
- `POST /api/invites/join` - Join lab via invite token

### Items
- `GET /api/labs/[labId]/items` - List items (with search/filters)
- `POST /api/labs/[labId]/items` - Create item
- `GET /api/labs/[labId]/items/[itemId]` - Get item details
- `PUT /api/labs/[labId]/items/[itemId]` - Update item
- `DELETE /api/labs/[labId]/items/[itemId]` - Delete item
- `POST /api/labs/[labId]/items/[itemId]/move` - Move item
- `GET /api/labs/[labId]/items/[itemId]/qr` - Generate QR code

### Photos
- `GET /api/labs/[labId]/items/[itemId]/photos` - List photos
- `POST /api/labs/[labId]/items/[itemId]/photos` - Upload photo

### Locations
- `GET /api/labs/[labId]/locations` - List locations
- `POST /api/labs/[labId]/locations` - Create location

### Activity
- `GET /api/labs/[labId]/activities` - Get activity feed

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed database with test data

# Linting
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker

```bash
# Build image
docker build -t omicsvault .

# Run container
docker run -p 3000:3000 omicsvault
```

## Contributing

This is a private project for Complete Omics Inc. For questions or issues, please contact the development team.

## License

Proprietary - Complete Omics Inc.

## Support

For support, please contact support@completeomics.com

---

**Built with ❤️ by Complete Omics Inc.**
