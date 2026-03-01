'use client'

import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'

type ImageUploadFieldProps = {
  value: string
  onChange: (url: string) => void
  type: 'logo' | 'favicon' | 'banner' | 'hero' | 'chip' | 'category'
  label?: string
  placeholder?: string
  previewSize?: 'sm' | 'md' | 'lg' | 'tall'
}

export function ImageUploadField({
  value,
  onChange,
  type,
  label,
  placeholder,
  previewSize = 'md',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        onChange(data.url)
      } else {
        setError(data?.error || 'Upload failed')
      }
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-24 h-12',
    lg: 'w-32 h-20',
    tall: 'w-12 h-24',
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div className="flex items-start gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>
      {value && (
        <div className={`mt-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center ${sizeClasses[previewSize]}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="max-w-full max-h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
