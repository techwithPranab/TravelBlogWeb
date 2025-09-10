'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { partnersApi, Partner } from '@/lib/api';

type PartnerStatus = 'pending' | 'approved' | 'rejected';

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const partnerId = params.id as string;

  const fetchPartner = async () => {
    try {
      setLoading(true);
      const response = await partnersApi.getById(partnerId);
      setPartner(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchPartner();
    }
  }, [partnerId]);

  const updatePartnerStatus = async (newStatus: PartnerStatus) => {
    try {
      setUpdating(true);
      await partnersApi.updateStatus(partnerId, newStatus);

      // Update local state
      if (partner) {
        setPartner({ ...partner, status: newStatus });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const deletePartner = async () => {
    if (!confirm('Are you sure you want to delete this partner submission? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      await partnersApi.delete(partnerId);
      router.push('/admin/partners');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete partner');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status: PartnerStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">
            {error || 'Partner not found'}
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/admin/partners')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Partners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {partner.firstName} {partner.lastName}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Partner submission details and management
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => router.push('/admin/partners')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Partners
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Partner Details */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Partner Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Details about this partnership request.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {partner.firstName} {partner.lastName}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a href={`mailto:${partner.email}`} className="text-indigo-600 hover:text-indigo-500">
                  {partner.email}
                </a>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a href={`tel:${partner.phone}`} className="text-indigo-600 hover:text-indigo-500">
                  {partner.phone}
                </a>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {partner.company}
              </dd>
            </div>
            {partner.website && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    {partner.website}
                  </a>
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Partnership Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {partner.partnershipType}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(partner.status)}`}>
                  {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(partner.createdAt).toLocaleDateString()} at{' '}
                {new Date(partner.createdAt).toLocaleTimeString()}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {partner.updatedAt ? (
                  <>
                    {new Date(partner.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(partner.updatedAt).toLocaleTimeString()}
                  </>
                ) : (
                  'Not updated yet'
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Message</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="whitespace-pre-wrap">{partner.message}</div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Actions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Update the status of this partner submission or delete it.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Update Status
              </label>
              <select
                id="status"
                value={partner.status}
                onChange={(e) => updatePartnerStatus(e.target.value as PartnerStatus)}
                disabled={updating}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={deletePartner}
                disabled={updating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {updating ? 'Deleting...' : 'Delete Partner'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
