'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CountryFilter } from '@/components/common/CountryFilter';

interface Photo {
  _id: string;
  title: string;
  description: string;
  location: {
    country: string;
    city: string;
  };
  tags: string[];
  imageUrl: string;
  thumbnailUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  photographer?: {
    name: string;
    email: string;
  };
}

export default function GalleryClient() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const photosPerPage = 12;

  // Get all unique tags, locations, and countries for filters
  const allTags = Array.from(new Set(photos.flatMap(photo => photo.tags)));
  const allLocations = Array.from(new Set(
    photos.map(photo => `${photo.location.city}, ${photo.location.country}`).filter(Boolean)
  ));
  const allCountries = Array.from(new Set(photos.map(photo => photo.location.country).filter(Boolean)));

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [photos, searchTerm, selectedTag, selectedLocation, selectedCountry]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos?status=approved`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched photos:', data.photos || data.data);
        setPhotos(data.photos || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    let filtered = photos;

    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${photo.location.city}, ${photo.location.country}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(photo => photo.tags.includes(selectedTag));
    }

    if (selectedLocation) {
      filtered = filtered.filter(photo =>
        `${photo.location.city}, ${photo.location.country}` === selectedLocation
      );
    }

    if (selectedCountry && selectedCountry !== 'all') {
      filtered = filtered.filter(photo => photo.location.country === selectedCountry);
    }

    setFilteredPhotos(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setSelectedLocation('');
    setSelectedCountry('all');
  };

  // Pagination
  const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);
  const startIndex = (currentPage - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;
  const currentPhotos = filteredPhotos.slice(startIndex, endIndex);

  const generateStructuredData = () => {
    const photoCount = photos.length;
    return {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "TravelBlog Photo Gallery",
      "description": `Curated collection of ${photoCount} travel photos from around the world`,
      "url": "https://travelblog.com/gallery",
      "image": photos.slice(0, 5).map(photo => ({
        "@type": "ImageObject",
        "url": photo.imageUrl,
        "name": photo.title,
        "description": photo.description,
        "author": photo.photographer ? {
          "@type": "Person",
          "name": photo.photographer.name || "Anonymous"
        } : undefined
      })).filter(item => item.author), // Only include photos with valid authors
      "about": {
        "@type": "Thing",
        "name": "Travel Photography"
      },
      "provider": {
        "@type": "Organization",
        "name": "TravelBlog",
        "url": "https://travelblog.com"
      }
    };
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData())
        }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Travel Photo Gallery
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Discover amazing travel moments captured by adventurers around the world
          </p>
          <div className="mt-8 text-blue-100">
            <p className="text-lg">{photos.length} photos from {allLocations.length} destinations</p>
          </div>
        </div>
      </div>

      {/* Upload Photo Call-to-Action */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Share Your Travel Moments
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Have an amazing travel photo? Share it with our community and inspire fellow travelers around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/submit-photo"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload Your Photo
              </Link>
              <div className="text-sm text-gray-500">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Photos are reviewed before being published
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search photos, locations, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              {/* Country Filter */}
              <CountryFilter
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                countries={allCountries}
                placeholder="All Countries"
              />

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {allLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              {(searchTerm || selectedTag || selectedLocation || selectedCountry !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {currentPhotos.length} of {filteredPhotos.length} photos
            {(searchTerm || selectedTag || selectedLocation || selectedCountry !== 'all') && (
              <span className="ml-2">
                {searchTerm && `for "${searchTerm}"`}
                {selectedTag && `tagged "${selectedTag}"`}
                {selectedLocation && `in ${selectedLocation}`}
                {selectedCountry !== 'all' && `from ${selectedCountry}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPhotos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedTag || selectedLocation || selectedCountry !== 'all'
                ? "Try adjusting your search or filters"
                : "Be the first to share your travel photos!"}
            </p>
            {(searchTerm || selectedTag || selectedLocation || selectedCountry !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentPhotos.map((photo) => (
                <button
                  key={photo._id}
                  className="group text-left w-full"
                  onClick={() => handlePhotoClick(photo)}
                  aria-label={`View ${photo.title} photo`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
                    <Image
                      src={photo.thumbnailUrl || photo.imageUrl}
                      alt={photo.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200" />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium text-gray-900 truncate">{photo.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{photo.location.city}, {photo.location.country}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photo.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {photo.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{photo.tags.length - 2} more</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNumber > totalPages) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Upload Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          href="/submit-photo"
          className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-110"
          aria-label="Upload a photo"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Link>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-full h-[60vh] bg-gray-100">
              <Image
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>

            <div className="p-6 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPhoto.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{selectedPhoto.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedPhoto.location.city}, {selectedPhoto.location.country}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {selectedPhoto.photographer?.name || 'Anonymous'}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedPhoto.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
