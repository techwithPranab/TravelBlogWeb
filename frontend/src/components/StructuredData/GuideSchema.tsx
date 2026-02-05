import React from 'react';
import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
}

interface GuideSchemaProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image: string;
  url: string;
  faqs?: FAQItem[];
  steps?: string[];
}

export default function GuideSchema({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
  faqs = [],
  steps = [],
}: GuideSchemaProps) {
  const howToData = steps.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    image: image.startsWith('http') ? image : `https://bagpackstories.in${image}`,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: `Step ${index + 1}`,
      text: step,
    })),
    author: {
      '@type': 'Person',
      name: author,
    },
    datePublished: datePublished,
    ...(dateModified && { dateModified: dateModified }),
  } : null;

  const faqData = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image.startsWith('http') ? image : `https://bagpackstories.in${image}`,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
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
  };

  return (
    <>
      <Script
        id="guide-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
        strategy="beforeInteractive"
      />
      {howToData && (
        <Script
          id="guide-howto-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToData) }}
          strategy="beforeInteractive"
        />
      )}
      {faqData && (
        <Script
          id="guide-faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
          strategy="beforeInteractive"
        />
      )}
    </>
  );
}
