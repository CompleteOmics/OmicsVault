// User types
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Lab types
export interface Lab {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
    locations: number;
  };
}

// Location types
export interface Location {
  id: string;
  name: string;
  type: string;
  description?: string;
  parentId?: string;
  parent?: Location;
  children?: Location[];
  items?: Item[];
  labId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

// Item types
export interface Item {
  id: string;
  name: string;
  category?: string;
  vendor?: string;
  catalogNumber?: string;
  lotNumber?: string;
  quantity: number;
  unit?: string;
  minQuantity?: number;
  expirationDate?: string;
  openedDate?: string;
  remarks?: string;
  labId: string;
  locationId: string;
  location: Location;
  createdById: string;
  createdBy: User;
  lastUpdatedById?: string;
  lastUpdatedBy?: User;
  photos: Photo[];
  movements: Movement[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  name: string;
  category: string;
  vendor: string;
  catalogNumber: string;
  lotNumber: string;
  quantity: string;
  unit: string;
  minQuantity: string;
  locationId: string;
  remarks: string;
  expirationDate: string;
  openedDate: string;
}

// Photo types
export interface Photo {
  id: string;
  filename: string;
  url: string;
  caption?: string;
  itemId: string;
  createdAt: string;
}

// Movement types
export interface Movement {
  id: string;
  quantity?: number;
  movedAt: string;
  notes?: string;
  itemId: string;
  fromLocationId: string;
  fromLocation: Location;
  toLocationId: string;
  toLocation: Location;
  movedById: string;
  movedBy: User;
}

// Activity types
export type ActivityType =
  | 'ITEM_CREATED'
  | 'ITEM_UPDATED'
  | 'ITEM_DELETED'
  | 'ITEM_MOVED'
  | 'QUANTITY_CHANGED'
  | 'PHOTO_ADDED'
  | 'PHOTO_DELETED'
  | 'LOCATION_CREATED'
  | 'LOCATION_UPDATED'
  | 'LOCATION_DELETED'
  | 'MEMBER_JOINED'
  | 'MEMBER_REMOVED';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  labId: string;
  userId: string;
  user: User;
  createdAt: string;
}

// Expiration types
export interface ExpirationData {
  expiring: Item[];
  expired: Item[];
}

export interface ExpirationStatus {
  status: 'expired' | 'critical' | 'warning' | 'ok' | null;
  days: number;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  Lab: { labId: string };
  ItemDetail: { labId: string; itemId: string };
  ItemCreate: { labId: string };
  ItemEdit: { labId: string; itemId: string };
  LocationCreate: { labId: string; parentId?: string };
  LocationDetail: { labId: string; locationId: string };
  QRScanner: { labId: string };
};

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SignUpResponse {
  user: User;
}
