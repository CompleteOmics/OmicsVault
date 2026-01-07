# OmicsVault - Quick Setup Guide

This guide will help you get OmicsVault up and running in under 10 minutes.

## Step 1: Install Dependencies

First, make sure you have Node.js 18+ installed. Then install the project dependencies:

```bash
cd omicsvault
npm install
```

## Step 2: Set Up PostgreSQL Database

You'll need a PostgreSQL database. You have several options:

### Option A: Local PostgreSQL
If you have PostgreSQL installed locally:
```bash
createdb omicsvault
```

### Option B: Docker PostgreSQL
```bash
docker run --name omicsvault-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=omicsvault -p 5432:5432 -d postgres:15
```

### Option C: Cloud PostgreSQL
Use a cloud provider like:
- [Neon](https://neon.tech) (Free tier available)
- [Supabase](https://supabase.com) (Free tier available)
- [Railway](https://railway.app) (Free tier available)

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
# Update this with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/omicsvault?schema=public"

# Generate a secret key (run: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"

# Keep these as is for local development
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Step 4: Initialize Database

Push the Prisma schema to your database:

```bash
npx prisma db push
```

## Step 5: Seed Test Data (Optional but Recommended)

Load sample data to explore the app:

```bash
npm run db:seed
```

This creates:
- 2 test users (Admin & Researcher)
- 1 test lab with locations and items
- Sample activity history

**Test Login Credentials:**
- Admin: `admin@omicsvault.com` / `password123`
- Researcher: `researcher@omicsvault.com` / `password123`

## Step 6: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Explore OmicsVault

If you seeded the database, you can log in with the test credentials and explore:

1. **Dashboard** - View your labs
2. **Lab View** - Browse items, locations, and activity
3. **Add Items** - Create new inventory items with all biotech fields
4. **Create Locations** - Build your location hierarchy (Room → Freezer → Shelf → Box)
5. **Upload Photos** - Add visual references to items
6. **Generate QR Codes** - Create printable labels
7. **Track Movements** - See complete audit trail
8. **Activity Feed** - Monitor all lab changes

## Common Issues

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Prisma Client Not Found
```bash
npx prisma generate
```

## Next Steps

### For Development
- Open Prisma Studio to view/edit data: `npm run db:studio`
- Check the API routes in `/app/api`
- Customize the UI in `/app` components

### For Production
- Set up a production PostgreSQL database
- Configure environment variables for production
- Deploy to Vercel, Railway, or your preferred platform
- Set up file storage (AWS S3, Cloudinary) for production photo uploads

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Sync schema with database
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:seed          # Seed test data

# Code Quality
npm run lint             # Run ESLint
```

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the API documentation in README
- Contact support@completeomics.com

---

**Ready to start? Run `npm run dev` and visit http://localhost:3000**
