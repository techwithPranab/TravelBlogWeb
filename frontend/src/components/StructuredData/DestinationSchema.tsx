import React from 'react';
import Script from 'next/script';

interface DestinationSchemaProps {
  name: string;
  description: string;
  image: string;
  url: string;
  latitude?: number;
  longitude?: number;
  addressCountry?: string;
  addressRegion?: string;
  addressLocality?: string;
  rating?: number;
  ratingCount?: number;
  bestTimeToVisit?: string;
  popularActivities?: string[];
}

export default function DestinationSchema({
  name,
  description,
  image,
  url,
  latitude,
  longitude,
  addressCountry,
  addressRegion,
  addressLocality,
  rating,
  ratingCount,
  bestTimeToVisit,
  popularActivities = [],
}: DestinationSchemaProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: name,
    description: description,
    image: image.startsWith('http') ? image : `https://bagpackstories.in${image}`,
    url: url.startsWith('http') ? url : `https://bagpackstories.in${url}`,
    ...(latitude && longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: latitude,
        longitude: longitude,
      },
    }),
    ...(addressCountry && {
      address: {
        '@type': 'PostalAddress',
        addressCountry: addressCountry,
        ...(addressRegion && { addressRegion: addressRegion }),
        ...(addressLocality && { addressLocality: addressLocality }),
      },
    }),
    ...(rating && ratingCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        reviewCount: ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(bestTimeToVisit && {
      touristType: bestTimeToVisit,
    }),
    ...(popularActivities.length > 0 && {
      includesAttraction: popularActivities.map((activity) => ({
        '@type': 'TouristAttraction',
        name: activity,
      })),
    }),
    isAccessibleForFree: true,
  };

  return (
    <Script
      id="destination-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      strategy="beforeInteractive"
    />
  );
}
