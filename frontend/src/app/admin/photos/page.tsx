'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/adminApi';

interface Photo {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
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
  };
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve');
  const [moderationNotes, setModerationNotes] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const fetchPhotos = async (status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }
      
      const response = await adminApi.get<PhotoResponse>(`/photos/admin/all?${params.toString()}`);
      
      if (response?.data) {
        setPhotos(Array.isArray(response.data) ? response.data : []);
        setStatusCounts(
          response.statusCounts && typeof response.statusCounts === 'object'
            ? response.statusCounts
            : { pending: 0, approved: 0, rejected: 0 }
        );
      } else {
        console.error('Invalid response structure or no data:', response);
        setPhotos([]);
        setStatusCounts({ pending: 0, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      // Set default values on error
      setPhotos([]);
      setStatusCounts({ pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(selectedStatus);
  }, [selectedStatus]);

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
      fetchPhotos(selectedStatus);
    } catch (error) {
      console.error('Error moderating photo:', error);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      try {
        await adminApi.delete(`/photos/admin/${photoId}`);
        fetchPhotos(selectedStatus);
      } catch (error) {
        console.error('Error deleting photo:', error);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">Total Photos</h3>
              <p className="text-2xl font-bold text-blue-600">
                {statusCounts.pending + statusCounts.approved + statusCounts.rejected}
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
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="all">All Photos</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Photo Image */}
              <div className="relative">
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(photo.status)}`}>
                    {photo.status}
                  </span>
                </div>
                {photo.isFeatured && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-black mb-2">{photo.title}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{photo.description}</p>
                
                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <p><span className="font-medium text-black">Photographer:</span> {photo.photographer.name}</p>
                  <p><span className="font-medium text-black">Location:</span> {photo.location.city ? `${photo.location.city}, ` : ''}{photo.location.country}</p>
                  <p><span className="font-medium text-black">Category:</span> {photo.category}</p>
                  <p><span className="font-medium text-black">Likes:</span> {Array.isArray(photo.likes) ? photo.likes.length : 0}</p>
                  <p><span className="font-medium text-black">Submitted:</span> {formatDate(photo.submittedAt)}</p>
                  {photo.moderatedAt && (
                    <p><span className="font-medium text-black">Moderated:</span> {formatDate(photo.moderatedAt)}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {photo.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openModerationModal(photo, 'approve')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModerationModal(photo, 'reject')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handleDelete(photo._id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Delete
                  </button>
                  
                  <a
                    href={photo.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    View Full
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No photos found matching the selected criteria.</p>
          </div>
        )}
      </div>

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
