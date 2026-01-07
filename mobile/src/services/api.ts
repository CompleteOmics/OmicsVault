import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  User,
  Lab,
  Location,
  Item,
  ItemFormData,
  Activity,
  ExpirationData,
  LoginResponse,
  SignUpResponse,
} from '../types';

// Configure the API base URL - update this for production
const API_BASE_URL = __DEV__
  ? 'http://10.0.0.213:3000/api'  // Your Mac's IP address on same WiFi
  : 'https://your-production-api.com/api';

// Get base server URL by removing /api suffix
const getBaseServerUrl = () => {
  if (API_BASE_URL.endsWith('/api')) {
    return API_BASE_URL.slice(0, -4);
  }
  return API_BASE_URL;
};

// Export the base server URL for constructing image URLs
export const BASE_SERVER_URL = getBaseServerUrl();

const TOKEN_KEY = 'auth_token';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await this.getStoredToken();
        }
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  async hasToken(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }

  // Auth endpoints
  async signIn(email: string, password: string): Promise<LoginResponse> {
    // For NextAuth credentials, we need to handle this differently
    // Since NextAuth uses sessions, we'll create a custom endpoint for mobile
    const response = await this.api.post('/auth/mobile/signin', { email, password });
    const data = response.data;
    if (data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  async signUp(name: string, email: string, password: string): Promise<SignUpResponse> {
    const response = await this.api.post('/auth/signup', { name, email, password });
    return response.data;
  }

  async signOut(): Promise<void> {
    await this.clearToken();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.api.get('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }

  // Labs endpoints
  async getLabs(): Promise<Lab[]> {
    const response = await this.api.get('/labs');
    return response.data;
  }

  async getLab(labId: string): Promise<Lab> {
    const response = await this.api.get(`/labs/${labId}`);
    return response.data;
  }

  async createLab(data: { name: string; description?: string }): Promise<Lab> {
    const response = await this.api.post('/labs', data);
    return response.data;
  }

  async deleteLab(labId: string): Promise<void> {
    await this.api.delete(`/labs/${labId}`);
  }

  async createInvite(labId: string, data?: { expiresInDays?: number; maxUses?: number | null }): Promise<any> {
    const response = await this.api.post(`/labs/${labId}/invites`, data || {});
    return response.data;
  }

  async getInvites(labId: string): Promise<any[]> {
    const response = await this.api.get(`/labs/${labId}/invites`);
    return response.data;
  }

  async joinLabWithInvite(token: string): Promise<any> {
    const response = await this.api.post('/invites/join', { token });
    return response.data;
  }

  // Items endpoints
  async getItems(labId: string, params?: { search?: string; lowStock?: boolean; locationId?: string }): Promise<Item[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.lowStock) queryParams.append('lowStock', 'true');
    if (params?.locationId) queryParams.append('locationId', params.locationId);

    const response = await this.api.get(`/labs/${labId}/items?${queryParams}`);
    return response.data;
  }

  async getItemsByLocation(labId: string, locationId: string): Promise<Item[]> {
    const response = await this.api.get(`/labs/${labId}/items?locationId=${locationId}`);
    return response.data;
  }

  async getItem(labId: string, itemId: string): Promise<Item> {
    const response = await this.api.get(`/labs/${labId}/items/${itemId}`);
    return response.data;
  }

  async createItem(labId: string, data: ItemFormData): Promise<Item> {
    const response = await this.api.post(`/labs/${labId}/items`, data);
    return response.data;
  }

  async updateItem(labId: string, itemId: string, data: Partial<ItemFormData>): Promise<Item> {
    const response = await this.api.patch(`/labs/${labId}/items/${itemId}`, data);
    return response.data;
  }

  async deleteItem(labId: string, itemId: string): Promise<void> {
    await this.api.delete(`/labs/${labId}/items/${itemId}`);
  }

  async moveItem(labId: string, itemId: string, toLocationId: string): Promise<void> {
    await this.api.post(`/labs/${labId}/items/${itemId}/move`, { toLocationId });
  }

  async uploadPhoto(labId: string, itemId: string, uri: string): Promise<void> {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    await this.api.post(`/labs/${labId}/items/${itemId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async generateQRCode(labId: string, itemId: string): Promise<string> {
    const response = await this.api.get(`/labs/${labId}/items/${itemId}/qr`);
    return response.data.qrCode;
  }

  // Locations endpoints
  async getLocations(labId: string): Promise<Location[]> {
    const response = await this.api.get(`/labs/${labId}/locations`);
    return response.data;
  }

  async getLocation(labId: string, locationId: string): Promise<Location> {
    const response = await this.api.get(`/labs/${labId}/locations/${locationId}`);
    return response.data;
  }

  async createLocation(labId: string, data: { name: string; type: string; description?: string; parentId?: string }): Promise<Location> {
    const response = await this.api.post(`/labs/${labId}/locations`, data);
    return response.data;
  }

  async updateLocation(labId: string, locationId: string, data: Partial<{ name: string; type: string; description?: string }>): Promise<Location> {
    const response = await this.api.patch(`/labs/${labId}/locations/${locationId}`, data);
    return response.data;
  }

  async deleteLocation(labId: string, locationId: string): Promise<void> {
    await this.api.delete(`/labs/${labId}/locations/${locationId}`);
  }

  // Activities endpoints
  async getActivities(labId: string, limit?: number): Promise<Activity[]> {
    const queryParams = limit ? `?limit=${limit}` : '';
    const response = await this.api.get(`/labs/${labId}/activities${queryParams}`);
    return response.data;
  }

  // Expiration endpoints
  async getExpiringItems(labId: string, days: number = 30): Promise<ExpirationData> {
    const response = await this.api.get(`/labs/${labId}/expiring?days=${days}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
