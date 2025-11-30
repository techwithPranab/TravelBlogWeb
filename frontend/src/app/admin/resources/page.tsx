'use client';

import { useState, useEffect } from 'react';
import { resourcesApi, Resource } from '@/lib/api';
import { Plus, Search, Edit, Trash2, Eye, ExternalLink, Star, Shield, CreditCard, BookOpen, Wifi } from 'lucide-react';
import Link from 'next/link';

export default function ResourcesAdminPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchResources = async (page = 1, search = '', category = 'all', type = 'all', status = 'all') => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
      };
      
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (type !== 'all') params.type = type;
      if (status === 'active') params.isActive = true;
      if (status === 'inactive') params.isActive = false;
      if (status === 'featured') params.isFeatured = true;
      if (status === 'recommended') params.isRecommended = true;

      const response = await resourcesApi.getAll(params);

      setResources(response.data.resources);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSearch = () => {
    fetchResources(1, searchTerm, categoryFilter, typeFilter, statusFilter);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    fetchResources(1, searchTerm, category, typeFilter, statusFilter);
    setCurrentPage(1);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    fetchResources(1, searchTerm, categoryFilter, type, statusFilter);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchResources(1, searchTerm, categoryFilter, typeFilter, status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchResources(page, searchTerm, categoryFilter, typeFilter, statusFilter);
    setCurrentPage(page);
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourcesApi.delete(resourceId);
        fetchResources(currentPage, searchTerm, categoryFilter, typeFilter, statusFilter);
      } catch (err) {
        setError('Failed to delete resource');
      }
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Guide':
      case 'Template':
        return BookOpen;
      case 'App':
      case 'Website':
        return Wifi;
      case 'Tool':
        return CreditCard;
      default:
        return Shield;
    }
  };

  const categories = ['all', 'Booking', 'Gear', 'Apps', 'Websites', 'Services', 'Transportation', 'Insurance', 'Other'];
  const types = ['all', 'Tool', 'Service', 'Product', 'Website', 'App', 'Guide', 'Template'];
  const statuses = ['all', 'active', 'inactive', 'featured', 'recommended'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600">Manage travel resources and tools</p>
        </div>
        <Link
          href="/admin/resources/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="flex">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {/* Results count */}
          <div className="flex items-center text-sm text-gray-600">
            {loading ? 'Loading...' : `${resources.length} resources`}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Resources Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category/Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating/Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading resources...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No resources found
                  </td>
                </tr>
              ) : (
                resources.map((resource) => {
                  const IconComponent = getResourceIcon(resource.type);
                  return (
                    <tr key={resource._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {resource.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resource.category}</div>
                        <div className="text-sm text-gray-500">{resource.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {resource.averageRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">{resource.clickCount} clicks</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            resource.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {resource.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {resource.isFeatured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Featured
                            </span>
                          )}
                          {resource.isRecommended && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Recommended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(resource.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {resource.url && (
                            <a
                              href={resource.affiliateLink || resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Link
                            href={`/admin/resources/${resource._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/resources/${resource._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteResource(resource._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
