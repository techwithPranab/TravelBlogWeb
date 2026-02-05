import React from 'react';
import Script from 'next/script';

interface Author {
  name: string;
  _id?: string;
}

interface BlogPostSchemaProps {
  title: string;
  description: string;
  author: Author | string;
  datePublished: string;
  dateModified?: string;
  image: string;
  url: string;
  category?: string;
  tags?: string[];
  wordCount?: number;
}

export default function BlogPostSchema({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
  category,
  tags = [],
  wordCount,
}: BlogPostSchemaProps) {
  const authorName = typeof author === 'string' ? author : author.name;
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image.startsWith('http') ? image : `https://bagpackstories.in${image}`,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://bagpackstories.in/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BagPackStories',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bagpackstories.in/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url.startsWith('http') ? url : `https://bagpackstories.in${url}`,
    },
    ...(category && { articleSection: category }),
    ...(tags.length > 0 && { keywords: tags.join(', ') }),
    ...(wordCount && { wordCount: wordCount }),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };

  return (
    <Script
      id="blog-post-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      strategy="beforeInteractive"
    />
  );
}
