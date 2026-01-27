import { useState, useEffect, useCallback } from 'react';
import { CloudArrowUpIcon, ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import UserTable from './components/UserTable';
import Pagination from './components/Pagination';
import UploadModal from './components/UploadModal';
import UserFormModal from './components/UserFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ViewUserModal from './components/ViewUserModal';
import { getUsers, getUserById, deleteUser, createUser, updateUser } from './services/userService';
import type { User, PageResponse } from './types/User';

const TEMPLATE_URL = '/templates/user_import_template.xlsx';
const PAGE_SIZE = 10;

function App() {
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Search filter
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PageResponse<User> = await getUsers({
        keyword: searchKeyword || undefined,
        page: currentPage - 1, // API uses 0-based page
        size: PAGE_SIZE,
      });
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchKeyword]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUploadSuccess = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleCreateNew = () => {
    setSelectedUser(null);
    setIsUserFormModalOpen(true);
  };

  const handleView = async (user: User) => {
    try {
      const fullUser = await getUserById(user.id);
      setViewUser(fullUser);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      alert('Lỗi khi tải thông tin người dùng');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsUserFormModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleHistory = (user: User) => {
    // TODO: Implement history view
    alert(`Xem lịch sử thay đổi của: ${user.userName}`);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    setIsSaving(true);
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, userData);
      } else {
        await createUser(userData);
      }
      setIsUserFormModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Lỗi khi lưu người dùng');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Lỗi khi xóa người dùng');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Danh sách người dùng</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <CloudArrowUpIcon className="w-5 h-5" />
            Upload
          </button>
          <a
            href={TEMPLATE_URL}
            download="user_import_template.xlsx"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-300 rounded-md hover:bg-orange-50"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Tải file mẫu
          </a>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
          >
            <PlusIcon className="w-5 h-5" />
            Tạo mới
          </button>
        </div>

        {/* Search Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm kiếm theo tên, email, username..."
            className="px-3 py-2 text-sm border border-gray-300 rounded-md w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Tìm kiếm
          </button>
        </div>

        {/* User Table */}
        <UserTable
          users={users}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHistory={handleHistory}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <UserFormModal
        isOpen={isUserFormModalOpen}
        user={selectedUser}
        onClose={() => setIsUserFormModalOpen(false)}
        onSave={handleSaveUser}
        isLoading={isSaving}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        user={selectedUser}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
      />

      <ViewUserModal
        isOpen={isViewModalOpen}
        user={viewUser}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleEdit}
      />
    </div>
  );
}

export default App;
