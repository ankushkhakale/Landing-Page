"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface EditableProfileProps {
  onProfileUpdate?: () => void
}

export function EditableProfile({ onProfileUpdate }: EditableProfileProps) {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || "",
    username: user?.user_metadata?.username || user?.user_metadata?.full_name || "",
    age: user?.user_metadata?.age || "",
    grade_level: user?.user_metadata?.grade_level || "",
    avatar_url: user?.user_metadata?.avatar_url || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }))
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert("Error uploading avatar. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          username: formData.username,
          age: formData.age,
          grade_level: formData.grade_level,
          avatar_url: formData.avatar_url,
        },
      })

      if (authError) {
        throw authError
      }

      // Update profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email!,
        full_name: formData.full_name,
        avatar_url: formData.avatar_url,
        age: formData.age ? Number.parseInt(formData.age) : null,
        grade_level: formData.grade_level,
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        throw profileError
      }

      // Update leaderboard
      await supabase.from("leaderboards").upsert({
        user_id: user.id,
        username: formData.username,
        avatar_url: formData.avatar_url,
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Profile Updated",
        message: "Your profile has been successfully updated!",
        type: "success",
      })

      setIsEditing(false)
      onProfileUpdate?.()

      // Refresh the user data
      await updateUser()
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: user?.user_metadata?.full_name || "",
      username: user?.user_metadata?.username || user?.user_metadata?.full_name || "",
      age: user?.user_metadata?.age || "",
      grade_level: user?.user_metadata?.grade_level || "",
      avatar_url: user?.user_metadata?.avatar_url || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-purple-200">
              <AvatarImage src={formData.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold">
                {formData.full_name?.charAt(0) || formData.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            {isEditing && (
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          <h3 className="text-xl font-bold mb-2">{formData.full_name || formData.username || "Learner"}</h3>
          <p className="text-muted-foreground mb-4">{user?.email}</p>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            {user?.user_metadata?.user_type || "Student"}
          </Badge>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Profile Settings</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="grade_level">Grade Level</Label>
              <Input
                id="grade_level"
                value={formData.grade_level}
                onChange={(e) => handleInputChange("grade_level", e.target.value)}
                disabled={!isEditing}
                className="mt-1"
                placeholder="e.g., 5th Grade, Middle School"
              />
            </div>
            <div>
              <Label htmlFor="user_type">User Type</Label>
              <Input
                id="user_type"
                value={user?.user_metadata?.user_type || "Student"}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
