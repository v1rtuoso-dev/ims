import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { User, UserRole } from '../types/User';

interface UserFormModalProps {
  isOpen: boolean;
  user: User | null; // null = create mode, User = edit mode
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
  isLoading: boolean;
}

export default function UserFormModal({ isOpen, user, onClose, onSave, isLoading }: UserFormModalProps) {
  const isEditMode = user !== null;

  const [formData, setFormData] = useState<Partial<User>>(() => ({
    userName: user?.userName || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDay: user?.birthDay || '',
    gender: user?.gender || '',
    status: user?.status || 'ACTIVE',
    userRoles: user?.userRoles || [],
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDay: user.birthDay || '',
        gender: user.gender || '',
        status: user.status || 'ACTIVE',
        userRoles: user.userRoles || [],
      });
    } else {
      setFormData({
        userName: '',
        fullName: '',
        email: '',
        phone: '',
        birthDay: '',
        gender: '',
        status: 'ACTIVE',
        userRoles: [],
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddRole = () => {
    const newRole: UserRole = {
      id: Date.now(), // temporary ID for new roles
      type: '',
      bank: '',
      branch: '',
      fromDate: null,
      toDate: null,
    };
    setFormData((prev) => ({
      ...prev,
      userRoles: [...(prev.userRoles || []), newRole],
    }));
  };

  const handleRemoveRole = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      userRoles: (prev.userRoles || []).filter((_, i) => i !== index),
    }));
  };

  const handleRoleChange = (index: number, field: keyof UserRole, value: string) => {
    setFormData((prev) => ({
      ...prev,
      userRoles: (prev.userRoles || []).map((role, i) =>
        i === index ? { ...role, [field]: value } : role
      ),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName?.trim()) {
      newErrors.userName = 'Username không được để trống';
    }
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[A-Za-z0-9._]+@msb\.com\.vn$/.test(formData.email)) {
      newErrors.email = 'Email phải có định dạng @msb.com.vn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Chỉnh sửa người dùng' : 'Tạo mới người dùng'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName || ''}
                  onChange={handleChange}
                  disabled={isEditMode}
                  className={`
                    w-full px-3 py-2 border rounded-md text-sm
                    ${errors.userName ? 'border-red-500' : 'border-gray-300'}
                    ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
                  `}
                  placeholder="Nhập username"
                />
                {errors.userName && <p className="mt-1 text-sm text-red-500">{errors.userName}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  className={`
                    w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.fullName ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="Nhập họ tên"
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className={`
                    w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.email ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="Nhập email (@msb.com.vn)"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {/* Birthday & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    name="birthDay"
                    value={formData.birthDay || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>
              </div>


              {/* Status */}
              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status || 'ACTIVE'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              )}

              {/* User Roles Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Thông tin phân quyền
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-300 rounded-md hover:bg-orange-100"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Thêm quyền
                  </button>
                </div>

                {(formData.userRoles || []).length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-2">Chưa có phân quyền</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(formData.userRoles || []).map((role, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-gray-700">Quyền {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Loại</label>
                            <input
                              type="text"
                              value={role.type || ''}
                              onChange={(e) => handleRoleChange(index, 'type', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Nhập loại quyền"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Ngân hàng</label>
                            <input
                              type="text"
                              value={role.bank || ''}
                              onChange={(e) => handleRoleChange(index, 'bank', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Nhập tên ngân hàng"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Chi nhánh</label>
                            <input
                              type="text"
                              value={role.branch || ''}
                              onChange={(e) => handleRoleChange(index, 'branch', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Nhập chi nhánh"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
                            <input
                              type="date"
                              value={role.fromDate || ''}
                              onChange={(e) => handleRoleChange(index, 'fromDate', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
                            <input
                              type="date"
                              value={role.toDate || ''}
                              onChange={(e) => handleRoleChange(index, 'toDate', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white rounded-md
                  ${isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}
                `}
              >
                {isLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
