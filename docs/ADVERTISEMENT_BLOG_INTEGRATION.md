# Advertisement Integration Guide for Blog Detail Page

## Overview
This document provides instructions for integrating advertisements into the blog detail page.

## Ad Placement Positions

### 1. Header Area
- **after_featured_image**: Banner ad after the featured image
- **before_content**: Leaderboard ad before main content starts

### 2. Content Area
- **content_top**: Native ad at the top of content
- **content_middle**: In-content ad in the middle of the article
- **content_bottom**: Native ad at the end of content
- **content_paragraph_1**: After first paragraph
- **content_paragraph_2**: After second paragraph
- **content_paragraph_3**: After third paragraph

### 3. Sidebar (Desktop)
- **sidebar_sticky**: Sticky sidebar ad (follows scroll)
- **sidebar_top**: Top of sidebar
- **sidebar_middle**: Middle of sidebar
- **sidebar_bottom**: Bottom of sidebar

### 4. After Content
- **after_gallery**: After image gallery
- **after_video**: After YouTube videos section
- **before_comments**: Before comments section
- **after_comments**: After comments section

### 5. Mobile Specific
- **sticky_footer**: Sticky footer ad on mobile
- **floating_bottom_right**: Floating button ad

## Implementation Steps

### Step 1: Update Blog Detail Page Layout

Add the following import at the top of `/frontend/src/app/blog/[slug]/page.tsx`:

\`\`\`typescript
import AdContainer from '@/components/ads/AdContainer'
\`\`\`

### Step 2: Add Ad Placements

Insert ad components in strategic positions:

\`\`\`tsx
{/* After Featured Image */}
<div className="container mx-auto px-4 py-6">
  <AdContainer
    placement="after_featured_image"
    blogPostId={post?.id}
    variant="banner"
    className="max-w-4xl mx-auto"
  />
</div>

{/* Before Content - Desktop Only */}
<div className="container mx-auto px-4 hidden md:block">
  <AdContainer
    placement="before_content"
    blogPostId={post?.id}
    variant="native-horizontal"
    className="max-w-4xl mx-auto mb-6"
  />
</div>

{/* Sidebar Layout for Desktop */}
<div className="container mx-auto px-4 pb-16">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Main Content - 8 columns */}
    <div className="lg:col-span-8">
      {/* Existing content sections */}
      {post?.content && (
        <div className="mb-12">
          <div className="prose prose-lg max-w-none">
            {/* ... existing content ... */}
          </div>
          
          {/* In-Content Ad */}
          <div className="my-8">
            <AdContainer
              placement="content_middle"
              blogPostId={post?.id}
              variant="native-card"
            />
          </div>
        </div>
      )}
      
      {/* Content sections */}
      {post?.contentSections && post.contentSections.length > 0 && (
        <div className="mb-12">
          {post.contentSections.map((section, index) => (
            <div key={section.id}>
              <ContentSection section={section} onImageClick={handleImageClick} />
              
              {/* Ad after every 2 sections */}
              {index > 0 && index % 2 === 1 && (
                <div className="my-8">
                  <AdContainer
                    placement={\`content_paragraph_\${Math.floor(index / 2) + 1}\`}
                    blogPostId={post?.id}
                    variant="native-minimal"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* After Gallery */}
      {post?.images && post.images.length > 0 && (
        <div className="my-8">
          <AdContainer
            placement="after_gallery"
            blogPostId={post?.id}
            variant="banner"
          />
        </div>
      )}
      
      {/* Before Comments */}
      <div className="my-8">
        <AdContainer
          placement="before_comments"
          blogPostId={post?.id}
          variant="native-horizontal"
        />
      </div>
      
      <CommentSection
        resourceId={post?.id || ''}
        resourceType="blog"
        comments={comments}
        onCommentSubmit={handleCommentSubmit}
      />
    </div>
    
    {/* Sidebar - 4 columns (Desktop Only) */}
    <aside className="hidden lg:block lg:col-span-4">
      <div className="space-y-6">
        {/* Sticky Sidebar Ad */}
        <AdContainer
          placement="sidebar_sticky"
          blogPostId={post?.id}
          variant="sidebar"
          sticky={true}
        />
        
        {/* Static Sidebar Ad */}
        <AdContainer
          placement="sidebar_middle"
          blogPostId={post?.id}
          variant="sidebar"
        />
      </div>
    </aside>
  </div>
</div>

{/* Sticky Footer Ad (Mobile Only) */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg">
  <AdContainer
    placement="sticky_footer"
    blogPostId={post?.id}
    variant="banner"
    className="max-w-md mx-auto p-2"
  />
</div>
\`\`\`

### Step 3: Best Practices

1. **Frequency**: Don't show more than 3-4 ads on a single page
2. **Placement**: Space ads evenly throughout content
3. **Mobile**: Use smaller, less intrusive ads on mobile
4. **Performance**: Lazy load ads below the fold
5. **User Experience**: Ensure ads don't disrupt reading flow

### Step 4: A/B Testing

Test different ad placements to find optimal positions:

- Test sidebar vs in-content ads
- Test native vs banner formats
- Test ad density (2 ads vs 4 ads per page)
- Track CTR by placement position

### Step 5: Monitoring

Track these metrics:
- CTR by placement position
- Viewability rate
- User engagement (time on page, bounce rate)
- Revenue per page view

## Expected Performance

Based on industry standards:

| Placement | Expected CTR | Viewability | Revenue Potential |
|-----------|--------------|-------------|-------------------|
| after_featured_image | 2-3% | 90%+ | High |
| content_middle | 1.5-2% | 80%+ | High |
| sidebar_sticky | 1.5-2% | 70%+ | Medium-High |
| sidebar_middle | 1-1.5% | 60%+ | Medium |
| before_comments | 0.8-1% | 50%+ | Medium |
| sticky_footer | 1-1.2% | 95%+ | High (Mobile) |

## Compliance

Ensure all ads include:
- ✅ "Advertisement" or "Sponsored" label
- ✅ `rel="nofollow sponsored"` attribute
- ✅ Proper ARIA labels for accessibility
- ✅ Non-intrusive design
- ✅ Respect user's DNT settings

## Next Steps

1. ✅ Install ad components (Done)
2. ⏳ Update blog detail page layout (In Progress)
3. ⏳ Test ad rendering and tracking
4. ⏳ Monitor performance metrics
5. ⏳ Optimize based on data

## Code Example - Complete Integration

See `/frontend/src/app/blog/[slug]/page-with-ads-example.tsx` for a complete working example.

