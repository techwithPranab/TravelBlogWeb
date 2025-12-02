import Image from 'next/image'

interface ContentSectionProps {
  section: {
    id: string
    type: 'text' | 'image-text' | 'image-only'
    title?: string
    content: string
    image?: {
      url: string
      alt: string
      caption?: string
    }
    imagePosition?: 'left' | 'right' | 'center' | 'full-width'
    order: number
  }
  onImageClick?: (imageUrl: string) => void
}

export default function ContentSection({ section, onImageClick }: ContentSectionProps) {
  const renderTextOnlySection = () => (
    <div className="prose prose-base max-w-none mb-12">
      {section.title && (
        <h2 className="text-xl font-bold text-gray-900 mb-6">{section.title}</h2>
      )}
      <div dangerouslySetInnerHTML={{ __html: section.content }} />
    </div>
  )

  const renderImageOnlySection = () => (
    <div className="mb-12">
      {section.title && (
        <h2 className="text-xl font-bold text-gray-900 mb-6">{section.title}</h2>
      )}
      {section.image && (
        <div className={`relative ${
          section.imagePosition === 'full-width' ? 'w-full' : 'mx-auto max-w-6xl'
        }`}>
          <div className={`relative ${
            section.imagePosition === 'full-width' 
              ? 'h-[500px] md:h-[600px]' 
              : 'h-80 md:h-96'
          } rounded-lg overflow-hidden group cursor-pointer`}>
            <Image
              src={section.image.url}
              alt={section.image.alt || 'Section image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {section.image.caption && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                {section.image.caption}
              </div>
            )}
            <button
              onClick={() => onImageClick?.(section.image!.url)}
              className="absolute inset-0 w-full h-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label="View image in full size"
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderImageTextSection = () => {
    if (!section.image) {
      return renderTextOnlySection()
    }

    const imageElement = (
      <div className="relative">
        <div className="relative h-80 md:h-96 rounded-lg overflow-hidden group cursor-pointer">
          <Image
            src={section.image.url}
            alt={section.image.alt || 'Section image'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {section.image.caption && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              {section.image.caption}
            </div>
          )}
          <button
            onClick={() => onImageClick?.(section.image!.url)}
            className="absolute inset-0 w-full h-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            aria-label="View image in full size"
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    )

    const textElement = (
      <div className="prose prose-base max-w-none">
        {section.title && (
          <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
        )}
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      </div>
    )

    if (section.imagePosition === 'center') {
      return (
        <div className="mb-12">
          {section.title && (
            <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">{section.title}</h2>
          )}
          <div className="mb-8">
            {imageElement}
          </div>
          <div className="prose prose-base max-w-none">
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>
        </div>
      )
    }

    if (section.imagePosition === 'full-width') {
      return (
        <div className="mb-12">
          {section.title && (
            <h2 className="text-xl font-bold text-gray-900 mb-8">{section.title}</h2>
          )}
          <div className="mb-8">
            <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden group cursor-pointer">
              <Image
                src={section.image.url}
                alt={section.image.alt || 'Section image'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {section.image.caption && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                  {section.image.caption}
                </div>
              )}
              <button
                onClick={() => onImageClick?.(section.image!.url)}
                className="absolute inset-0 w-full h-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                aria-label="View image in full size"
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="prose prose-base max-w-none">
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>
        </div>
      )
    }

    // Left or right positioning
    return (
      <div className="mb-12">
        {section.title && (
          <h2 className="text-xl font-bold text-gray-900 mb-8">{section.title}</h2>
        )}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${
          section.imagePosition === 'right' ? 'lg:grid-flow-col-dense' : ''
        }`}>
          <div className={section.imagePosition === 'right' ? 'lg:col-start-2' : ''}>
            {imageElement}
          </div>
          <div className={section.imagePosition === 'right' ? 'lg:col-start-1' : ''}>
            <div className="prose prose-base max-w-none">
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  switch (section.type) {
    case 'text':
      return renderTextOnlySection()
    case 'image-only':
      return renderImageOnlySection()
    case 'image-text':
      return renderImageTextSection()
    default:
      return renderTextOnlySection()
  }
}
