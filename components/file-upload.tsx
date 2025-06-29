"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, ImageIcon, Video, X, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface FileUploadProps {
  onFileProcessed: (fileData: any) => void
  difficulty: string
  contentType: string
}

interface UploadedFile {
  id: string
  file: File
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  result?: any
  error?: string
}

export function FileUpload({ onFileProcessed, difficulty, contentType }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const { user } = useAuth()
  const supabase = createClient()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: "uploading" as const,
        progress: 0,
      }))

      setFiles((prev) => [...prev, ...newFiles])

      for (const fileData of newFiles) {
        await processFile(fileData)
      }
    },
    [difficulty, contentType, user?.id],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [".mp4", ".avi", ".mov"],
      "text/*": [".txt", ".md"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const processFile = async (fileData: UploadedFile) => {
    try {
      // Update status to uploading
      setFiles((prev) => prev.map((f) => (f.id === fileData.id ? { ...f, status: "uploading", progress: 25 } : f)))

      // Create storage bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets()
      const userFilesBucket = buckets?.find((bucket) => bucket.name === "user-files")

      if (!userFilesBucket) {
        const { error: bucketError } = await supabase.storage.createBucket("user-files", {
          public: false,
          fileSizeLimit: 52428800, // 50MB
        })
        if (bucketError && !bucketError.message.includes("already exists")) {
          console.warn("Bucket creation warning:", bucketError.message)
        }
      }

      // Upload to Supabase Storage
      const fileExt = fileData.file.name.split(".").pop()
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(fileName, fileData.file)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Update progress
      setFiles((prev) => prev.map((f) => (f.id === fileData.id ? { ...f, progress: 50 } : f)))

      // Save file record to database
      const { data: fileRecord, error: dbError } = await supabase
        .from("uploaded_files")
        .insert({
          user_id: user?.id,
          file_name: fileData.file.name,
          file_type: fileData.file.type,
          file_size: fileData.file.size,
          file_url: uploadData.path,
          processing_status: "processing",
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        throw new Error(`Database error: ${dbError.message}`)
      }

      // Update status to processing
      setFiles((prev) => prev.map((f) => (f.id === fileData.id ? { ...f, status: "processing", progress: 75 } : f)))

      // Process file content
      let extractedText = ""

      if (fileData.file.type.startsWith("text/")) {
        extractedText = await fileData.file.text()
      } else if (fileData.file.type.startsWith("image/")) {
        // Convert image to base64 and extract text
        const base64 = await fileToBase64(fileData.file)
        try {
          const response = await fetch("/api/extract-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageData: base64.split(",")[1],
              userId: user?.id,
            }),
          })

          const data = await response.json()
          if (data.success) {
            extractedText = data.text
          } else {
            throw new Error(data.error)
          }
        } catch (error) {
          console.error("Text extraction error:", error)
          throw new Error("Failed to extract text from image")
        }
      } else if (fileData.file.type === "application/pdf") {
        // PDF processing not yet implemented
        throw new Error("PDF processing not yet implemented. Please use image or text files.")
      } else {
        throw new Error("Unsupported file type. Please use image or text files.")
      }

      // Generate content based on type
      let result
      try {
        if (contentType === "quiz") {
          const response = await fetch("/api/generate-quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: extractedText,
              difficulty,
              questionCount: 15,
              userId: user?.id,
            }),
          })

          const data = await response.json()
          if (data.success) {
            result = data.quiz
          } else {
            throw new Error(data.error)
          }
        } else if (contentType === "summary") {
          const response = await fetch("/api/generate-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: extractedText,
              userId: user?.id,
            }),
          })

          const data = await response.json()
          if (data.success) {
            result = { summary: data.summary }
          } else {
            throw new Error(data.error)
          }
        } else {
          result = { content: extractedText }
        }
      } catch (aiError) {
        console.error("AI processing error:", aiError)
        throw new Error(`Failed to process content: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`)
      }

      // Save generated content
      if (contentType === "quiz" && result.questions) {
        const { error: quizError } = await supabase.from("quizzes").insert({
          user_id: user?.id,
          file_id: fileRecord.id,
          title: result.title || `Quiz: ${fileData.file.name}`,
          difficulty_level: difficulty,
          total_questions: result.questions.length,
          questions: result.questions,
        })

        if (quizError) {
          console.error("Quiz save error:", quizError)
        }
      }

      // Update file status to completed
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                result,
              }
            : f,
        ),
      )

      // Update file record
      await supabase.from("uploaded_files").update({ processing_status: "completed" }).eq("id", fileRecord.id)

      onFileProcessed({ ...fileRecord, result })
    } catch (error) {
      console.error("Error processing file:", error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error occurred",
              }
            : f,
        ),
      )
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />
    if (type.startsWith("video/")) return <Video className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all
          ${isDragActive
            ? "border-blue-400 bg-blue-50 dark:bg-indigo-900/40"
            : "border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900 dark:to-indigo-900"}
        `}
      >
        <input {...getInputProps()} />
        <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Upload className="w-10 h-10 text-white drop-shadow-lg" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-blue-700 dark:text-cyan-200">
          {isDragActive ? "Drop files here!" : "Drag & Drop Your Files"}
        </h3>
        <p className="text-blue-500 dark:text-cyan-300 mb-6">Support for PDFs, images, videos, and text files (Max 50MB)</p>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold px-8 shadow">
          Choose Files
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Processing Files</h4>
          {files.map((file) => (
            <Card key={file.id} className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{getFileIcon(file.file.type)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
                    <p className="text-sm text-gray-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>

                  <div className="flex-1">
                    {file.status !== "completed" && file.status !== "error" && (
                      <div className="space-y-2">
                        <Progress value={file.progress} className="h-2" />
                        <p className="text-xs text-gray-500 capitalize">{file.status}...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.status === "completed" && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {file.status === "error" && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {file.error && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{file.error}</p>
                  </div>
                )}

                {file.status === "completed" && file.result && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">
                      ✅ {contentType === "quiz" ? "Quiz generated successfully!" : "Content processed successfully!"}
                    </p>
                    {contentType === "quiz" && file.result.questions && (
                      <p className="text-xs text-green-500 mt-1">Generated {file.result.questions.length} questions</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
