import type { ServiceResult, PaginatedResponse, QueryParams } from './types';
import type { UserRole } from '@/lib/roles';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  location?: string;
  isVerified: boolean;
  isGuide: boolean;
  guideProfile?: {
    expertise: string[];
    experienceYears: number;
    certifications: string[];
    languages: string[];
    rating: number;
    reviewCount: number;
    bio: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserService {
  getProfile(): Promise<ServiceResult<User>>;
  updateProfile(data: Partial<User>): Promise<ServiceResult<User>>;
  getById(id: string): Promise<ServiceResult<User>>;
  listGuides(params?: QueryParams): Promise<PaginatedResponse<User>>;
  updateRole(userId: string, role: UserRole): Promise<ServiceResult<User>>;
}
