'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contactApi, ContactMessage } from '@/lib/api';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const contactId = params.id as string;

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await contactApi.getById(contactId);
      setContact(response.data);
      
      // Mark as read if it's unread
      if (response.data.status === 'unread') {
        await updateStatus('read');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contact');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'unread' | 'read' | 'replied') => {
    if (!contact) return;

    try {
      setUpdating(true);
      await contactApi.updateStatus(contact._id, newStatus);
      setContact({ ...contact, status: newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const deleteContact = async () => {
    if (!contact) return;
    
    if (!confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      await contactApi.delete(contact._id);
      router.push('/admin/contacts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyInfo = (createdAt: string) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 7) return { class: 'text-red-600', text: 'High Priority (>7 days old)' };
    if (daysSinceCreated > 3) return { class: 'text-yellow-600', text: 'Medium Priority (>3 days old)' };
    return { class: 'text-green-600', text: 'Normal Priority' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error || 'Contact not found'}</div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/admin/contacts')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Contacts
          </button>
        </div>
      </div>
    );
  }

  const urgency = getUrgencyInfo(contact.createdAt);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/admin/contacts')}
              className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Contacts
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Contact Message Details</h1>
            <p className="mt-1 text-sm text-gray-600">
              Received on {new Date(contact.createdAt).toLocaleDateString()} at{' '}
              {new Date(contact.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${urgency.class}`}>
              {urgency.text}
            </span>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeClass(contact.status)}`}>
              {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Contact Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and message content.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contact.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a 
                  href={`mailto:${contact.email}`} 
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {contact.email}
                </a>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Subject</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{contact.subject}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Message</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
                  {contact.message}
                </div>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <select
                  value={contact.status}
                  onChange={(e) => updateStatus(e.target.value as 'unread' | 'read' | 'replied')}
                  disabled={updating}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
                {updating && (
                  <span className="ml-2 text-sm text-gray-500">Updating...</span>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Received</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(contact.createdAt).toLocaleDateString()} at{' '}
                {new Date(contact.createdAt).toLocaleTimeString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <div className="flex space-x-3">
          <a
            href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
            onClick={() => updateStatus('replied')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Reply via Email
          </a>
          {contact.status === 'unread' && (
            <button
              onClick={() => updateStatus('read')}
              disabled={updating}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Mark as Read
            </button>
          )}
        </div>
        <div>
          <button
            onClick={deleteContact}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Message
          </button>
        </div>
      </div>
    </div>
  );
}
