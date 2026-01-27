import { useState, useEffect, useRef } from 'react';
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { User } from '../types/User';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onHistory: (user: User) => void;
}

export default function UserTable({ users, isLoading, onView, onEdit, onDelete, onHistory }: UserTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-blue-500';
      case 'INACTIVE':
        return 'bg-gray-400';
      case 'PENDING':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getGenderText = (gender: string | null): string => {
    if (!gender) return '';
    switch (gender.toUpperCase()) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      default:
        return gender;
    }
  };

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 border-b"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white border-b flex items-center px-4 gap-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">User HRIS</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Họ tên</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Email</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Số điện thoại</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ngày sinh</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Giới tính</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Phân hệ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Người tạo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ngày tạo</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b w-12"></th>
            </tr>
          </thead>
        </table>
        <div className="py-12 text-center text-gray-500">
          Không có dữ liệu
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User HRIS</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giới tính</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phân hệ</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onView(user)}
            >
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{user.userName}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{user.fullName}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{user.email}</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(user.status)}`} title={user.status}></span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{user.phone || ''}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(user.birthDay)}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{getGenderText(user.gender)}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{user.userRoles?.[0]?.type || ''}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{user.createdBy || ''}</td>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(user.createdTime)}</td>
              <td className="px-4 py-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === user.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onEdit(user);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onDelete(user);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Xóa
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onHistory(user);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ClockIcon className="w-4 h-4" />
                      Lịch sử thay đổi
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
