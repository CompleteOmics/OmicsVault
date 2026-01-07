# OmicsVault Mobile App

A React Native mobile application for OmicsVault - the professional inventory management system for biotech laboratories. Built with Expo for iOS and Android platforms.

## Features

- **Authentication**: Secure sign in and sign up with password strength indicator
- **Dashboard**: View and manage all your labs with elegant lab cards
- **Lab View**: Tabbed interface for Items, Locations, and Activity
- **Item Management**: Create, view, and edit items with full details
- **Expiration Tracking**: Visual alerts for expired and expiring items
- **Location Management**: Hierarchical location structure with nested locations
- **Photo Capture**: Take photos using device camera or choose from library
- **QR Code Support**: Generate and scan QR codes for quick item access
- **Movement History**: Track item movements between locations
- **Activity Feed**: View recent actions in each lab

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Expo Go app on your physical device (for testing)

## Setup

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure the API URL:**

   Edit `src/services/api.ts` and update the `API_BASE_URL` to point to your backend:
   ```typescript
   const API_BASE_URL = __DEV__
     ? 'http://localhost:3000/api'  // Development
     : 'https://your-production-api.com/api';  // Production
   ```

   For testing on a physical device, use your computer's local IP address:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.100:3000/api';
   ```

4. **Start the Next.js backend:**
   ```bash
   # In the root omicsvault directory
   npm run dev
   ```

5. **Start the Expo development server:**
   ```bash
   # In the mobile directory
   npm start
   # or
   expo start
   ```

6. **Run on a device or emulator:**
   - Press `i` to open iOS Simulator
   - Press `a` to open Android Emulator
   - Scan the QR code with Expo Go on your physical device

## Backend API Requirements

The mobile app requires a mobile-friendly authentication endpoint. Add the following endpoint to your Next.js backend:

### Create `/app/api/auth/mobile/signin/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Error signing in:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

### Create `/app/api/auth/me/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
```

Add `jsonwebtoken` to your backend dependencies and add `JWT_SECRET` to your `.env` file.

## Project Structure

```
mobile/
├── App.tsx                 # Main app entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── babel.config.js         # Babel configuration
├── assets/                 # App icons and splash screen
└── src/
    ├── components/
    │   ├── common/         # Reusable components (Card, Badge, etc.)
    │   └── navigation/     # Navigation configuration
    ├── context/            # Auth context and state management
    ├── hooks/              # Custom React hooks
    ├── screens/
    │   ├── auth/           # Sign in/up screens
    │   ├── dashboard/      # Dashboard screen
    │   ├── labs/           # Lab view screen
    │   ├── items/          # Item detail, create, QR scanner
    │   └── locations/      # Location management
    ├── services/           # API service
    ├── types/              # TypeScript types
    └── utils/              # Theme and utilities
```

## Building for Production

### iOS
```bash
expo build:ios
# or with EAS Build
eas build --platform ios
```

### Android
```bash
expo build:android
# or with EAS Build
eas build --platform android
```

## Design System

The app uses a custom design system matching the web application:

- **Colors**: Primary blue (#0C88F1), slate grays, semantic colors
- **Typography**: System fonts with consistent sizing
- **Spacing**: 4px base unit (xs, sm, md, lg, xl, xxl)
- **Border Radius**: 8px, 12px, 16px, 20px
- **Shadows**: Small, medium, and large elevation levels

## Technologies Used

- **Expo SDK 50**: React Native development platform
- **React Navigation 6**: Navigation and routing
- **React Native Paper**: Material Design components
- **Zustand**: State management
- **Axios**: HTTP client
- **Expo Camera**: Camera and barcode scanning
- **Expo Image Picker**: Photo library access
- **Expo Secure Store**: Secure token storage
- **date-fns**: Date formatting

## Troubleshooting

### Camera/Photo Permissions
Ensure you have granted camera and photo library permissions when prompted. You can reset permissions in your device settings.

### API Connection Issues
- Verify the backend server is running
- Check the API_BASE_URL in api.ts
- For physical devices, use your computer's LAN IP address
- Ensure your firewall allows connections on port 3000

### iOS Simulator Camera
The iOS Simulator doesn't support camera functionality. Use a physical device or test photo upload from the library.

## License

Copyright 2024 Complete Omics Inc.
