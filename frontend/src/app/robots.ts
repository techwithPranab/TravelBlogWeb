import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/contributor/',
          '/dashboard/',
          '/login',
          '/signup',
          '/reset-password',
          '/forgot-password',
          '/*.json$',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/contributor/',
          '/dashboard/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'GPTBot', // OpenAI's web crawler
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/contributor/',
          '/dashboard/',
          '/login',
          '/signup',
        ],
      },
      {
        userAgent: 'ChatGPT-User', // ChatGPT browsing
        allow: '/',
      },
      {
        userAgent: 'Google-Extended', // Google Bard
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai', // Claude AI
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot', // Perplexity AI
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
