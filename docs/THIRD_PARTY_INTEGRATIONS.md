# Third-Party Integrations

## ☁️ Cloudinary Media Management

### Configuration
```typescript
// config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### Usage Patterns
```typescript
// Photo upload
const uploadResult = await cloudinary.uploader.upload(file.path, {
  folder: 'travelblog/photos',
  transformation: [
    { width: 1200, height: 800, crop: 'fill' },
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
});

// Image optimization
const optimizedUrl = cloudinary.url(publicId, {
  transformation: [
    { width: 400, crop: 'scale' },
    { quality: 'auto', format: 'webp' }
  ]
});
```

### Features Used
- Image upload and storage
- Automatic format optimization (WebP, AVIF)
- Responsive image transformations
- CDN delivery
- Usage analytics

## 🗄️ AWS S3 Backup Storage

### Configuration
```typescript
// config/aws.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;
```

### Backup Strategy
```typescript
// Automatic backup of high-traffic images
const backupToS3 = async (cloudinaryUrl: string, filename: string) => {
  const response = await fetch(cloudinaryUrl);
  const buffer = await response.buffer();

  await s3.upload({
    Bucket: bucketName,
    Key: `backups/${filename}`,
    Body: buffer,
    ContentType: response.headers.get('content-type'),
    ACL: 'private'
  }).promise();
};
```

### Cost Optimization
- Infrequent access storage class
- Automatic lifecycle policies
- Compression before storage

## 💳 Stripe Payment Processing

### Configuration
```typescript
// config/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
```

### Checkout Session Creation
```typescript
// Create payment session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: service.name,
        description: service.description,
      },
      unit_amount: service.price * 100, // cents
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.FRONTEND_URL}/payment/success`,
  cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
});
```

### Webhook Handling
```typescript
// Webhook endpoint for payment confirmation
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Update user subscription/premium status
      await updateUserPremiumStatus(session.metadata.userId);
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## 📧 SendGrid Email Service

### Configuration
```typescript
// config/sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

### Email Templates
```typescript
// Welcome email
const sendWelcomeEmail = async (user: User) => {
  const msg = {
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateId: process.env.WELCOME_TEMPLATE_ID,
    dynamicTemplateData: {
      name: user.name,
      loginUrl: `${process.env.FRONTEND_URL}/auth/login`,
    },
  };
  await sgMail.send(msg);
};

// Newsletter
const sendNewsletter = async (subscribers: string[], content: NewsletterContent) => {
  const msg = {
    to: subscribers,
    from: process.env.FROM_EMAIL,
    templateId: process.env.NEWSLETTER_TEMPLATE_ID,
    dynamicTemplateData: {
      subject: content.subject,
      content: content.body,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/newsletter/unsubscribe`,
    },
  };
  await sgMail.sendMultiple(msg);
};
```

### Features Used
- Dynamic email templates
- Bulk email sending
- Bounce handling
- Email analytics
- IP warming

## 🗺️ Mapbox Mapping Service

### Configuration
```typescript
// Frontend configuration
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Backend configuration (for geocoding)
const mapboxClient = new MapboxClient(process.env.MAPBOX_ACCESS_TOKEN);
```

### Map Integration
```typescript
// components/home/InteractiveTravelMap.tsx
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [0, 20],
  zoom: 2,
});

// Add destination markers
destinations.forEach(destination => {
  const marker = new mapboxgl.Marker()
    .setLngLat(destination.coordinates)
    .setPopup(new mapboxgl.Popup().setHTML(popupContent))
    .addTo(map);
});
```

### Geocoding Service
```typescript
// Convert address to coordinates
const geocodeAddress = async (address: string) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
  );
  const data = await response.json();
  return data.features[0]?.center; // [lng, lat]
};
```

## 📊 Google Drive Integration

### Configuration
```typescript
// config/drive.ts
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });
```

### File Backup Strategy
```typescript
// Backup important files to Google Drive
const backupToDrive = async (filePath: string, filename: string) => {
  const fileMetadata = {
    name: filename,
    parents: [process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID],
  };

  const media = {
    mimeType: 'application/octet-stream',
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  return response.data.id;
};
```

## 🔍 Search Functionality

### Current Implementation
- Basic text search across posts
- Category and destination filtering
- Author-based filtering

### Future Enhancements
```typescript
// Planned: Elasticsearch integration
const elasticsearch = require('@elastic/elasticsearch');

const client = new elasticsearch.Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY,
  }
});

// Index posts for search
const indexPost = async (post: Post) => {
  await client.index({
    index: 'posts',
    id: post._id,
    body: {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      categories: post.categories,
      destinations: post.destinations,
      author: post.author,
      tags: post.tags,
    }
  });
};
```

## 📱 Push Notifications

### Future Implementation
```typescript
// Firebase Cloud Messaging setup
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Send push notification
const sendNotification = async (token: string, title: string, body: string) => {
  await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body },
    }),
  });
};
```

## 📈 Analytics Integration

### Google Analytics
```typescript
// Frontend integration
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.GA_TRACKING_ID} />
      </body>
    </html>
  );
}

// Event tracking
const trackEvent = (eventName: string, parameters: object) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};
```

### Custom Analytics
```typescript
// Backend analytics collection
const trackPageView = async (userId: string, page: string, metadata: object) => {
  await Analytics.create({
    userId,
    action: 'page_view',
    page,
    metadata,
    timestamp: new Date(),
  });
};
```

## 🔒 Security Integrations

### Rate Limiting
```typescript
// Redis-based rate limiting
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

### CAPTCHA Integration
```typescript
// Google reCAPTCHA
const verifyRecaptcha = async (token: string) => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const data = await response.json();
  return data.success;
};
```

## 🔄 Webhook Integrations

### GitHub Webhooks
```typescript
// For automatic deployments
app.post('/webhooks/github', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const isValid = verifySignature(req.body, signature);

  if (isValid && req.headers['x-github-event'] === 'push') {
    // Trigger deployment
    exec('npm run deploy');
  }
});
```

### Monitoring & Alerting
```typescript
// Sentry error tracking
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error boundary in React
import * as Sentry from '@sentry/react';

<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

This documentation covers all third-party integrations currently implemented and planned for the TravelBlog platform.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/docs/THIRD_PARTY_INTEGRATIONS.md
