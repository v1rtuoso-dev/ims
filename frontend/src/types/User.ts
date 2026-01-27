export interface User {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDay: string | null;
  gender: string | null;
  status: string;
  createdBy: string | null;
  createdTime: string | null;
  updatedBy: string | null;
  updatedTime: string | null;
  userRoles: UserRole[] | null;
}

export interface UserRole {
  id: number;
  type: string;
  bank: string;
  branch: string;
  fromDate: string | null;
  toDate: string | null;
}

export interface UserSearchParams {
  keyword?: string;
  page: number;
  size: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
