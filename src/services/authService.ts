import { apiClient, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from './apiClient';
import type {
  AssignPermissionsRequest,
  CreateRoleRequest,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  RoleResponse,
  UpdateUserRequest,
  UserInfo,
  UserResponse,
} from '../types';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(data.user));
    return data;
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/refresh', { refreshToken });
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
    }
  },

  async getMe(): Promise<UserInfo> {
    const { data } = await apiClient.get<UserInfo>('/auth/me');
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(data));
    return data;
  },

  // Users API (/users)
  async getAllUsers(): Promise<UserResponse[]> {
    const { data } = await apiClient.get<UserResponse[]>('/users');
    return data;
  },

  async createUser(payload: CreateUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>('/users', payload);
    return data;
  },

  async updateUser(id: string, payload: UpdateUserRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(`/users/${id}`, payload);
    return data;
  },

  // Roles API (/roles)
  async getAllRoles(): Promise<RoleResponse[]> {
    const { data } = await apiClient.get<RoleResponse[]>('/roles');
    return data;
  },

  async createRole(payload: CreateRoleRequest): Promise<RoleResponse> {
    const { data } = await apiClient.post<RoleResponse>('/roles', payload);
    return data;
  },

  async assignPermissions(roleId: string, payload: AssignPermissionsRequest): Promise<RoleResponse> {
    const { data } = await apiClient.put<RoleResponse>(`/roles/${roleId}/permissions`, payload);
    return data;
  },
};

