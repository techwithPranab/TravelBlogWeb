# Advertisement System - Quick Reference Guide
## TravelBlogWeb

---

## 📋 Quick Links

- **Full Documentation**: [ADVERTISEMENT_FRAMEWORK_IMPLEMENTATION.md](./ADVERTISEMENT_FRAMEWORK_IMPLEMENTATION.md)
- **Progress Report**: [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)
- **Backend Code**: `backend/src/models/Advertisement.ts`
- **API Routes**: `backend/src/routes/advertisementRoutes.ts`

---

## 🎯 Advertisement Types

```typescript
// 17 Different Ad Types Available
'announcement'           // Site announcements, alerts
'hotel'                 // Hotel partnerships
'travel_accessories'    // Gear, luggage, equipment
'tour_operator'         // Tour companies, guides
'airline'               // Flight deals, airline partners
'insurance'             // Travel insurance
'booking_platform'      // Booking.com, Airbnb, etc.
'destination_promotion' // Tourism boards
'restaurant'            // Dining partnerships
'transportation'        // Car rentals, buses, trains
'photography'           // Camera gear, photo services
'experience'            // Activities, excursions
'financial'             // Travel cards, currency exchange
'technology'            // Apps, gadgets, SIM cards
'affiliate'             // General affiliate products
'sponsored_content'     // Native advertising
'custom'                // Custom/Other
```

---

## 📐 Advertisement Formats

```typescript
// 13 Different Formats
'banner'        // Standard banner (728x90, 970x90)
'rectangle'     // Medium rectangle (300x250)
'skyscraper'    // Wide skyscraper (160x600)
'leaderboard'   // Leaderboard (728x90)
'mobile_banner' // Mobile (320x50, 320x100)
'native'        // Native content cards
'interstitial'  // Full-page overlay (use sparingly)
'sticky'        // Sticky footer/header
'in_content'    // Embedded in article content
'sidebar'       // Sidebar widget
'popup'         // Popup (use with caution)
'video'         // Video ads
'carousel'      // Multi-item carousel
```

---

## 📍 Placement Positions (35 Available)

### Header Area
- `header_top` - Above blog header
- `header_bottom` - Below blog header

### Featured Image Area
- `before_featured_image`
- `after_featured_image`
- `overlay_featured_image` - Corner overlay

### Content Area (Most Important)
- `content_top` - Start of content
- `content_paragraph_1` - After 1st paragraph ⭐
- `content_paragraph_2` - After 2nd paragraph ⭐
- `content_paragraph_3` - After 3rd paragraph
- `content_middle` - Middle of content ⭐⭐⭐ (Best CTR)
- `content_bottom` - End of content
- `between_sections` - Between content sections

### Gallery Area
- `before_gallery`
- `after_gallery`
- `in_gallery` - Mixed with images

### Video Area
- `before_videos`
- `after_videos`

### Sidebar (Great for Desktop)
- `sidebar_top`
- `sidebar_middle` ⭐
- `sidebar_bottom`
- `sidebar_sticky` ⭐⭐ (Scrolls with page)

### Comments Area
- `before_comments`
- `after_comments`
- `in_comments`

### Author Bio
- `before_author_bio`
- `after_author_bio`

### Page Bottom
- `page_bottom`

### Floating/Sticky (Mobile)
- `floating_bottom_right`
- `floating_bottom_left`
- `sticky_footer` ⭐ (Mobile)
- `sticky_header`

---

## 🎨 Recommended Placements by Ad Type

### Hotels 🏨
- **Best**: `content_middle`, `sidebar_sticky`, `after_featured_image`
- **Format**: `banner`, `native`, `sidebar`

### Travel Accessories 🎒
- **Best**: `sidebar_middle`, `content_paragraph_2`, `after_gallery`
- **Format**: `native`, `carousel`, `rectangle`

### Tours & Experiences 🗺️
- **Best**: `content_top`, `before_gallery`, `after_author_bio`
- **Format**: `native`, `in_content`, `banner`

### Insurance 🛡️
- **Best**: `content_paragraph_1`, `sidebar_top`
- **Format**: `banner`, `native`

### Booking Platforms 🔖
- **Best**: `content_middle`, `sticky_footer` (mobile), `sidebar_sticky`
- **Format**: `leaderboard`, `sticky`, `mobile_banner`

---

## 🔧 API Endpoints Cheat Sheet

### Admin Endpoints (Requires Auth)

```bash
# Create Advertisement
POST /api/advertisements
Headers: Authorization: Bearer <token>
Body: { name, type, format, creative, destinationUrl, placements, schedule, status }

# List Advertisements
GET /api/advertisements?page=1&limit=20&status=active&type=hotel

# Get Advertisement
GET /api/advertisements/:id

# Update Advertisement
PUT /api/advertisements/:id
Body: { status: 'paused' }

# Delete Advertisement
DELETE /api/advertisements/:id

# Bulk Status Update
PATCH /api/advertisements/bulk-status
Body: { ids: [...], status: 'active' }

# Duplicate Advertisement
POST /api/advertisements/:id/duplicate

# Get Stats Overview
GET /api/advertisements/stats/overview
```

### Public Endpoints (No Auth)

```bash
# Get Active Ads
GET /api/advertisements/active?type=hotel&limit=10

# Get Ads for Placement
GET /api/advertisements/placement/content_middle?blogPostId=xxx&deviceType=desktop

# Get Ads for Blog
GET /api/advertisements/blog/:blogId
```

### Tracking Endpoints (No Auth)

```bash
# Track Impression
POST /api/ad-analytics/impression
Body: { adId, placement, deviceType, wasVisible }

# Track Click
POST /api/ad-analytics/click
Body: { adId, placement, deviceType }

# Track Conversion
POST /api/ad-analytics/conversion
Body: { adId, placement, conversionValue, conversionType }
```

### Analytics Endpoints (Admin Only)

```bash
# Get Ad Analytics
GET /api/ad-analytics/advertisement/:id?startDate=2026-01-01&endDate=2026-01-31

# Get Performance Report
GET /api/ad-analytics/performance?format=csv&startDate=2026-01-01

# Get Top Performers
GET /api/ad-analytics/top-performers?limit=10&metric=ctr

# Get Revenue Analytics
GET /api/ad-analytics/revenue?startDate=2026-01-01&endDate=2026-01-31&groupBy=day

# Export Analytics
GET /api/ad-analytics/export?format=csv
```

---

## 📝 Example Advertisement JSON

### Minimal Example
```json
{
  "name": "Booking.com Hotel Banner",
  "type": "hotel",
  "format": "banner",
  "creative": {
    "imageUrl": "https://cdn.example.com/booking-banner.jpg",
    "imageAlt": "Book hotels at Booking.com",
    "callToAction": "Book Now",
    "buttonText": "Find Hotels"
  },
  "destinationUrl": "https://booking.com",
  "placements": [{
    "position": "content_middle",
    "priority": 8
  }],
  "schedule": {
    "startDate": "2026-02-01T00:00:00Z"
  },
  "status": "active"
}
```

### Complete Example with All Features
```json
{
  "name": "Premium Hotel Campaign - Spring 2026",
  "title": "Luxury Hotels Await",
  "description": "Spring hotel promotion campaign",
  "type": "hotel",
  "format": "native",
  "creative": {
    "imageUrl": "https://cdn.example.com/hotel-native.jpg",
    "imageAlt": "Luxury hotel destinations",
    "mobileImageUrl": "https://cdn.example.com/hotel-mobile.jpg",
    "callToAction": "Discover luxury stays for your next adventure",
    "buttonText": "Explore Hotels",
    "backgroundColor": "#1a73e8",
    "textColor": "#ffffff"
  },
  "destinationUrl": "https://booking.com/spring-campaign",
  "utmParameters": {
    "source": "travelblog",
    "medium": "native-ad",
    "campaign": "spring-hotels-2026",
    "content": "blog-post"
  },
  "targeting": {
    "categories": ["60f1234567890abcdef12345"],
    "tags": ["luxury-travel", "europe", "hotels"],
    "deviceTypes": ["desktop", "tablet"],
    "userRoles": ["guest", "reader"],
    "geoLocations": ["US", "CA", "GB", "AU"],
    "dayOfWeek": [1, 2, 3, 4, 5],
    "timeOfDay": {
      "start": "09:00",
      "end": "21:00"
    }
  },
  "placements": [
    {
      "position": "content_middle",
      "priority": 9,
      "frequency": 3,
      "maxImpressionsPerUser": 5
    },
    {
      "position": "sidebar_sticky",
      "priority": 7,
      "maxImpressionsPerUser": 10
    }
  ],
  "schedule": {
    "startDate": "2026-03-01T00:00:00Z",
    "endDate": "2026-05-31T23:59:59Z",
    "timezone": "America/New_York"
  },
  "budget": {
    "type": "impressions",
    "maxImpressions": 100000,
    "dailyBudget": 3500,
    "totalBudget": 50000
  },
  "isPremium": true,
  "isSponsored": true,
  "partner": {
    "name": "Booking.com",
    "email": "partnerships@booking.com",
    "commission": 5
  },
  "seo": {
    "noFollow": true,
    "sponsored": true,
    "ugc": false
  },
  "status": "active",
  "notes": "Spring campaign focusing on European luxury destinations"
}
```

---

## 🎯 Targeting Rules

### Category Targeting
```json
{
  "targeting": {
    "categories": ["categoryId1", "categoryId2"],
    "excludeCategories": ["categoryId3"]
  }
}
// Show ONLY on posts in categoryId1 or categoryId2
// But NEVER on posts in categoryId3
```

### Tag Targeting
```json
{
  "targeting": {
    "tags": ["luxury", "europe"],
    "excludeTags": ["budget", "backpacking"]
  }
}
// Show ONLY on posts tagged "luxury" OR "europe"
// But NEVER on posts tagged "budget" OR "backpacking"
```

### Device Targeting
```json
{
  "targeting": {
    "deviceTypes": ["desktop", "tablet"]
  }
}
// Show ONLY on desktop and tablet, NOT on mobile
```

### Geo Targeting
```json
{
  "targeting": {
    "geoLocations": ["US", "CA", "GB"]
  }
}
// Show ONLY to users in USA, Canada, or United Kingdom
```

### Time Targeting
```json
{
  "targeting": {
    "dayOfWeek": [1, 2, 3, 4, 5],  // Monday to Friday
    "timeOfDay": {
      "start": "09:00",
      "end": "17:00"
    }
  }
}
// Show ONLY on weekdays between 9 AM and 5 PM
```

---

## 📊 Analytics Metrics Explained

### Impressions
- **Total**: Count of all times ad was displayed
- **Unique**: Count of unique users who saw the ad
- **Viewable**: Count when ad was 50%+ visible for 1+ second

### Clicks
- **Total**: Count of all clicks
- **Unique**: Count of unique users who clicked
- **Valid**: Clicks passing fraud detection

### CTR (Click-Through Rate)
```
CTR = (Clicks / Impressions) × 100
```
- **Good CTR**: 1-2%
- **Excellent CTR**: 2-5%
- **Outstanding CTR**: 5%+

### Conversions
- Actions taken after clicking (signup, purchase, etc.)
- **Conversion Rate** = (Conversions / Clicks) × 100

### Revenue
- **Total**: Sum of all conversion values
- **RPM** (Revenue Per Mille): Revenue per 1000 impressions
- **RPC** (Revenue Per Click): Average revenue per click

---

## 🚀 Quick Start Workflow

### Step 1: Create Your First Ad

1. **Login to Admin Dashboard**
   ```
   POST /api/auth/login
   { email: "admin@example.com", password: "..." }
   ```

2. **Create Advertisement**
   ```bash
   curl -X POST http://localhost:5000/api/advertisements \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Banner",
       "type": "hotel",
       "format": "banner",
       "creative": {
         "imageUrl": "https://via.placeholder.com/728x90",
         "imageAlt": "Test ad",
         "callToAction": "Click here"
       },
       "destinationUrl": "https://example.com",
       "placements": [{
         "position": "content_middle",
         "priority": 5
       }],
       "schedule": {
         "startDate": "2026-02-01T00:00:00Z"
       },
       "status": "active"
     }'
   ```

### Step 2: Verify Ad Appears

1. **Get Ads for Placement**
   ```bash
   curl http://localhost:5000/api/advertisements/placement/content_middle
   ```

2. **Check Response**
   - Should return your ad if it matches targeting rules
   - If no ad, check status, schedule, targeting

### Step 3: Track Performance

1. **Simulate Impression**
   ```bash
   curl -X POST http://localhost:5000/api/ad-analytics/impression \
     -H "Content-Type: application/json" \
     -d '{
       "adId": "YOUR_AD_ID",
       "placement": "content_middle",
       "deviceType": "desktop",
       "wasVisible": true
     }'
   ```

2. **Simulate Click**
   ```bash
   curl -X POST http://localhost:5000/api/ad-analytics/click \
     -H "Content-Type: application/json" \
     -d '{
       "adId": "YOUR_AD_ID",
       "placement": "content_middle",
       "deviceType": "desktop"
     }'
   ```

3. **Check Analytics**
   ```bash
   curl http://localhost:5000/api/ad-analytics/advertisement/YOUR_AD_ID \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 🐛 Troubleshooting

### Ad Not Showing?

**Check:**
1. ✅ Status is `active`
2. ✅ Start date is in the past
3. ✅ End date is in the future (or null)
4. ✅ Budget not exceeded
5. ✅ Targeting rules match the request context
6. ✅ Placement position is correct

### Low CTR?

**Optimize:**
1. 📍 Try different placements (`content_middle` is best)
2. 🎨 Update creative (better image, clearer CTA)
3. 🎯 Refine targeting (narrow to relevant audience)
4. ⏰ Adjust timing (test different days/hours)
5. 📱 Check device performance (desktop vs mobile)

### Tracking Not Working?

**Verify:**
1. ✅ Correct ad ID in tracking request
2. ✅ Session cookie is being set
3. ✅ No ad blockers interfering
4. ✅ CORS is configured correctly
5. ✅ Rate limits not exceeded

---

## 💡 Best Practices

### ✅ DO
- Start with 1-2 ads per placement
- Use native ads for better engagement
- Set realistic budgets
- Monitor CTR weekly
- A/B test different creatives
- Respect user privacy (GDPR, DNT)
- Label sponsored content clearly
- Optimize for mobile

### ❌ DON'T
- Show more than 3 ads above the fold
- Use intrusive formats (popups, interstitials)
- Ignore low-performing ads
- Set unrealistic targeting (too narrow)
- Forget to set end dates for campaigns
- Track users without consent
- Sacrifice UX for ad revenue
- Use clickbait tactics

---

## 📞 Need Help?

- **Documentation**: See full docs in `/docs`
- **Issues**: Create GitHub issue
- **Questions**: dev@travelblog.com

---

**Last Updated:** February 1, 2026  
**Version:** 1.0.0
