'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/adminApi';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Photo {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  photographer: {
    name: string;
    email: string;
  };
  location: {
    country: string;
    city?: string;
  };
  likes: string[] | any[]; // Can be ObjectId[] from backend or string[] from frontend
  submittedAt: string;
  moderatedBy?: {
    name: string;
    email: string;
  };
  moderatedAt?: string;
  moderationNotes?: string;
  isFeatured: boolean;
  s3Key?: string;
}

interface PhotoResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Photo[];
  statusCounts: {
    pending: number;
    approved: number;
    rejected: number;
    inactive: number;
  };
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve');
  const [moderationNotes, setModerationNotes] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    inactive: 0
  });

  const fetchPhotos = async (status?: string, page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await adminApi.get<PhotoResponse>(`/photos/admin/all?${params.toString()}`);
      
      if (response?.data) {
        setPhotos(Array.isArray(response.data) ? response.data : []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.page || 1);
        setStatusCounts(
          response.statusCounts && typeof response.statusCounts === 'object'
            ? response.statusCounts
            : { pending: 0, approved: 0, rejected: 0, inactive: 0 }
        );
      } else {
        console.error('Invalid response structure or no data:', response);
        setPhotos([]);
        setTotal(0);
        setTotalPages(1);
        setCurrentPage(1);
        setStatusCounts({ pending: 0, approved: 0, rejected: 0, inactive: 0 });
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      // Set default values on error
      setPhotos([]);
      setTotal(0);
      setTotalPages(1);
      setCurrentPage(1);
      setStatusCounts({ pending: 0, approved: 0, rejected: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(selectedStatus, currentPage);
  }, [selectedStatus, currentPage, limit]);

  const handleModerate = async () => {
    if (!selectedPhoto) return;

    try {
      // Map frontend action to backend status
      const statusMap = {
        approve: 'approved',
        reject: 'rejected'
      };

      const requestData = {
        status: statusMap[moderationAction],
        moderationNotes,
        ...(moderationAction === 'approve' && { isFeatured })
      };

      await adminApi.put(`/photos/admin/${selectedPhoto._id}/moderate`, requestData);
      
      setShowModerationModal(false);
      setSelectedPhoto(null);
      setModerationNotes('');
      setIsFeatured(false);
      
      // Refresh the photos list
      fetchPhotos(selectedStatus, currentPage);
      toast.success(`Photo ${moderationAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error moderating photo:', error);
      toast.error('Failed to moderate photo');
    }
  };

  const handleStatusChange = async (photoId: string, newStatus: string) => {
    try {
      await adminApi.put(`/photos/admin/${photoId}/status`, { status: newStatus });
      fetchPhotos(selectedStatus, currentPage);
      toast.success(`Photo status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating photo status:', error);
      toast.error('Failed to update photo status');
    }
  };

  const handleDelete = async (photoId: string) => {
    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      try {
        await adminApi.delete(`/photos/admin/${photoId}`);
        fetchPhotos(selectedStatus, currentPage);
        toast.success('Photo deleted successfully!');
      } catch (error) {
        console.error('Error deleting photo:', error);
        toast.error('Failed to delete photo');
      }
    }
  };

  const openModerationModal = (photo: Photo, action: 'approve' | 'reject') => {
    setSelectedPhoto(photo);
    setModerationAction(action);
    setModerationNotes('');
    setIsFeatured(false);
    setShowModerationModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when changing status
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-black mb-4">Photo Management</h1>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">Total Photos</h3>
              <p className="text-2xl font-bold text-blue-600">
                {statusCounts.pending + statusCounts.approved + statusCounts.rejected + statusCounts.inactive}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900">Pending Review</h3>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900">Approved</h3>
              <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900">Rejected</h3>
              <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Inactive</h3>
              <p className="text-2xl font-bold text-gray-600">{statusCounts.inactive}</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="all">All Photos</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} photos
            </div>
          </div>
        </div>

        {/* Photos Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {photos.map((photo) => (
                  <tr key={photo._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img
                            className="h-16 w-16 rounded-lg object-cover cursor-pointer hover:opacity-75"
                            src={photo.thumbnailUrl || photo.imageUrl}
                            alt={photo.title}
                            onClick={() => {
                              setSelectedPhoto(photo);
                              setShowImageModal(true);
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {photo.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {photo.description}
                          </div>
                          {photo.isFeatured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div><strong>Photographer:</strong> {photo.photographer.name}</div>
                        <div><strong>Location:</strong> {photo.location.city ? `${photo.location.city}, ` : ''}{photo.location.country}</div>
                        <div><strong>Category:</strong> {photo.category}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Submitted: {formatDate(photo.submittedAt)}
                        </div>
                        {photo.moderatedAt && (
                          <div className="text-xs text-gray-500">
                            Moderated: {formatDate(photo.moderatedAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(photo.status)}`}>
                        {photo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Likes: {Array.isArray(photo.likes) ? photo.likes.length : 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {/* Status Change Buttons */}
                        {photo.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(photo._id, 'approved')}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Approve
                          </button>
                        )}
                        {photo.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(photo._id, 'rejected')}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        )}
                        {photo.status !== 'inactive' && (
                          <button
                            onClick={() => handleStatusChange(photo._id, 'inactive')}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Inactive
                          </button>
                        )}
                        
                        {/* Action Buttons */}
                        <button
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setShowImageModal(true);
                          }}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </button>
                        
                        <a
                          href={photo.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Full
                        </a>
                        
                        <button
                          onClick={() => handleDelete(photo._id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((currentPage - 1) * limit) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * limit, total)}</span> of{' '}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}

          {photos.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No photos found matching the selected criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image View Modal */}
      {showImageModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{selectedPhoto.title}</h3>
                    <p className="text-sm text-gray-500">{selectedPhoto.photographer.name}</p>
                  </div>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full max-h-96 object-contain rounded"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Description:</strong> {selectedPhoto.description}</p>
                  <p><strong>Location:</strong> {selectedPhoto.location.city ? `${selectedPhoto.location.city}, ` : ''}{selectedPhoto.location.country}</p>
                  <p><strong>Category:</strong> {selectedPhoto.category}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedPhoto.status)}`}>
                      {selectedPhoto.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Modal */}
      {showModerationModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-black mb-4">
              {moderationAction === 'approve' ? 'Approve' : 'Reject'} Photo
            </h3>
            
            <div className="mb-4">
              <img
                src={selectedPhoto.thumbnailUrl || selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full h-32 object-cover rounded"
              />
              <h4 className="text-black font-medium mt-2">{selectedPhoto.title}</h4>
            </div>

            {moderationAction === 'approve' && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-black">Mark as Featured</span>
                </label>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="moderationNotes" className="block text-sm font-medium text-black mb-2">
                Moderation Notes (Optional)
              </label>
              <textarea
                id="moderationNotes"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                rows={3}
                placeholder="Add notes about this decision..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleModerate}
                className={`px-4 py-2 rounded text-white ${
                  moderationAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {moderationAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
              <button
                onClick={() => setShowModerationModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
