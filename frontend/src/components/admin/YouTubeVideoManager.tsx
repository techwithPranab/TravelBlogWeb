'use client'

import { useState } from 'react'
import { Plus, X, GripVertical, Youtube, Edit2, Save } from 'lucide-react'

interface YouTubeVideo {
  id: string
  title: string
  url: string
  description?: string
  order: number
}

interface YouTubeVideoManagerProps {
  videos: YouTubeVideo[]
  onChange: (videos: YouTubeVideo[]) => void
}

export default function YouTubeVideoManager({ videos, onChange }: YouTubeVideoManagerProps) {
  const [isAddingVideo, setIsAddingVideo] = useState(false)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    description: ''
  })
  const [editingVideo, setEditingVideo] = useState({
    title: '',
    url: '',
    description: ''
  })

  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) {
      alert('Please provide both title and URL')
      return
    }

    const video: YouTubeVideo = {
      id: `video-${Date.now()}`,
      title: newVideo.title.trim(),
      url: newVideo.url.trim(),
      description: newVideo.description.trim(),
      order: videos.length
    }

    onChange([...videos, video])
    setNewVideo({ title: '', url: '', description: '' })
    setIsAddingVideo(false)
  }

  const handleRemoveVideo = (videoId: string) => {
    const updatedVideos = videos
      .filter(v => v.id !== videoId)
      .map((v, index) => ({ ...v, order: index }))
    onChange(updatedVideos)
    // Cancel edit if this video was being edited
    if (editingVideoId === videoId) {
      setEditingVideoId(null)
    }
  }

  const handleStartEdit = (video: YouTubeVideo) => {
    setEditingVideoId(video.id)
    setEditingVideo({
      title: video.title,
      url: video.url,
      description: video.description || ''
    })
    // Cancel adding if in progress
    setIsAddingVideo(false)
  }

  const handleCancelEdit = () => {
    setEditingVideoId(null)
    setEditingVideo({
      title: '',
      url: '',
      description: ''
    })
  }

  const handleSaveEdit = (videoId: string) => {
    if (!editingVideo.title.trim() || !editingVideo.url.trim()) {
      alert('Please provide both title and URL')
      return
    }

    const updatedVideos = videos.map(v => 
      v.id === videoId 
        ? {
            ...v,
            title: editingVideo.title.trim(),
            url: editingVideo.url.trim(),
            description: editingVideo.description.trim()
          }
        : v
    )
    onChange(updatedVideos)
    setEditingVideoId(null)
    setEditingVideo({
      title: '',
      url: '',
      description: ''
    })
  }

  const handleMoveVideo = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === videos.length - 1)
    ) {
      return
    }

    const newVideos = [...videos]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    ;[newVideos[index], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[index]]
    
    // Update order values
    const updatedVideos = newVideos.map((video, idx) => ({
      ...video,
      order: idx
    }))

    onChange(updatedVideos)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">YouTube Videos</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add YouTube videos to enhance your blog post
          </p>
        </div>
        {!isAddingVideo && !editingVideoId && (
          <button
            type="button"
            onClick={() => setIsAddingVideo(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Youtube className="h-4 w-4" />
            <Plus className="h-4 w-4" />
            Add Video
          </button>
        )}
      </div>

      {/* Existing Videos */}
      {videos.length > 0 && (
        <div className="space-y-3">
          {videos
            .sort((a, b) => a.order - b.order)
            .map((video, index) => (
              <div
                key={video.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                {editingVideoId === video.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit Video
                      </h4>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        value={editingVideo.title}
                        onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                        placeholder="Enter video title..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL *
                      </label>
                      <input
                        type="url"
                        value={editingVideo.url}
                        onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={editingVideo.description}
                        onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                        placeholder="Brief description of the video..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(video.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleMoveVideo(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => handleMoveVideo(index, 'down')}
                        disabled={index === videos.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Youtube className="w-5 h-5 text-red-600" />
                          <h4 className="font-semibold text-gray-900">{video.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(video)}
                            className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                            aria-label="Edit video"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(video.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove video"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 break-all">{video.url}</p>
                      {video.description && (
                        <p className="text-sm text-gray-500">{video.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Add Video Form */}
      {isAddingVideo && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Add New Video</h4>
            <button
              type="button"
              onClick={() => {
                setIsAddingVideo(false)
                setNewVideo({ title: '', url: '', description: '' })
              }}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              placeholder="Enter video title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL *
            </label>
            <input
              type="url"
              value={newVideo.url}
              onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: youtube.com/watch?v=..., youtu.be/..., or video ID
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={newVideo.description}
              onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
              placeholder="Brief description of the video..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsAddingVideo(false)
                setNewVideo({ title: '', url: '', description: '' })
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddVideo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Video
            </button>
          </div>
        </div>
      )}

      {videos.length === 0 && !isAddingVideo && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Youtube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No videos added yet</p>
          <p className="text-sm text-gray-500">Click "Add Video" to include YouTube videos in your post</p>
        </div>
      )}
    </div>
  )
}
