'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  onUploadComplete?: (url: string) => void
  error?: string
  className?: string
}

export default function FileUpload({
  onFileSelect,
  onUploadComplete,
  error,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(selectedFile.type)) {
      onFileSelect(null)
      return
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      onFileSelect(null)
      return
    }

    setFile(selectedFile)
    onFileSelect(selectedFile)

    // Auto-upload
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadSuccess(true)
        onUploadComplete?.(result.data.url)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleRemove = () => {
    setFile(null)
    setUploadSuccess(false)
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-colors',
          dragActive && 'border-primary bg-primary/5',
          error && 'border-red-500',
          uploadSuccess && 'border-green-500 bg-green-50'
        )}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <Upload
              className={cn(
                'h-8 w-8 mb-2 transition-colors',
                dragActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <p className="text-sm text-muted-foreground mb-1 text-center">
              Drag and drop or click to upload
            </p>
            <p className="text-xs text-muted-foreground mb-4 text-center">
              Supports JPG, PNG, PDF up to 10MB
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Select File
            </Button>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {uploading && (
              <div className="mt-2">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
              </div>
            )}
            {uploadSuccess && (
              <div className="mt-2 flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs">Uploaded successfully</p>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

