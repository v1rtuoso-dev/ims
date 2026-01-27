import { XMarkIcon } from '@heroicons/react/24/outline';
import type { User } from '../types/User';

interface ViewUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onEdit: (user: User) => void;
}

export default function ViewUserModal({ isOpen, user, onClose, onEdit }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderText = (gender: string | null) => {
    if (!gender) return '-';
    return gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : gender;
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Thông tin người dùng</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Basic Information */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-4">Thông tin cơ bản</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">User HRIS</label>
                  <p className="mt-1 text-sm text-gray-900">{user.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Họ tên</label>
                  <p className="mt-1 text-sm text-gray-900">{user.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="mt-1 text-sm text-gray-900">{user.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ngày sinh</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.birthDay)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Giới tính</label>
                  <p className="mt-1 text-sm text-gray-900">{getGenderText(user.gender)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(user.status)}`}></span>
                    <span className="text-sm text-gray-900">{user.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Information */}
            {user.userRoles && user.userRoles.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-4">Thông tin phân quyền</h4>
                <div className="space-y-4">
                  {user.userRoles.map((role, index) => (
                    <div key={role.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Loại #{index + 1}</label>
                          <p className="mt-1 text-sm text-gray-900">{role.type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Ngân hàng</label>
                          <p className="mt-1 text-sm text-gray-900">{role.bank}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Chi nhánh</label>
                          <p className="mt-1 text-sm text-gray-900">{role.branch}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Từ ngày</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(role.fromDate)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Đến ngày</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(role.toDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-4">Thông tin hệ thống</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Người tạo</label>
                  <p className="mt-1 text-sm text-gray-900">{user.createdBy || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.createdTime)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Người cập nhật</label>
                  <p className="mt-1 text-sm text-gray-900">{user.updatedBy || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ngày cập nhật</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.updatedTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onEdit(user);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
