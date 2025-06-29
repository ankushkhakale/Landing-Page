"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import RuixenDialog from "@/components/ui/ruixen-dialog"

interface EditableProfileProps {
  onProfileUpdate?: () => void
}

export function EditableProfile({ onProfileUpdate }: EditableProfileProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || "",
    username: user?.user_metadata?.username || user?.user_metadata?.full_name || "",
    contact_no: user?.user_metadata?.contact_no || "",
    grade_level: user?.user_metadata?.grade_level || "",
    date_of_birth: user?.user_metadata?.date_of_birth || "",
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
      if (error instanceof Error) {
        console.error("Error uploading avatar:", error.message, error.stack)
      } else if (typeof error === "object" && error !== null) {
        console.error("Error uploading avatar:", JSON.stringify(error))
      } else {
        console.error("Error uploading avatar:", error)
      }
      alert("Error uploading avatar. Please try again.")
    } finally {
      setUploading(false)
    }
  };

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
                  <div className="loader-small">
                    <span></span>
                  </div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <h3 className="text-xl font-bold mb-2">{formData.full_name || formData.username || "Learner"}</h3>
          <p className="text-muted-foreground mb-4">{user?.email}</p>
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
                    <div className="loader-small mr-2">
                      <span></span>
                    </div>
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
              <Input id="full_name" value={formData.full_name} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={formData.username} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="mt-1 bg-muted" />
            </div>
            <div>
              <Label htmlFor="contact_no">Contact No</Label>
              <Input id="contact_no" value={formData.contact_no} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="grade_level">Grade Level</Label>
              <Input id="grade_level" value={formData.grade_level} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" value={formData.date_of_birth} disabled className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
      <RuixenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialValues={{
          full_name: formData.full_name,
          username: formData.username,
          email: user?.email || "",
          contact_no: formData.contact_no || "",
          grade_level: formData.grade_level,
          date_of_birth: formData.date_of_birth || "",
          avatar_url: formData.avatar_url,
        }}
        userId={user?.id || "anon"}
        onSave={async (values) => {
          if (!user) return;
          setLoading(true);
          setError(null);
          try {
            // Only send allowed fields to auth.updateUser (metadata)
            const { error: authError } = await supabase.auth.updateUser({
              data: {
                full_name: values.full_name,
                username: values.username,
                contact_no: values.contact_no,
                grade_level: values.grade_level,
                date_of_birth: values.date_of_birth,
                avatar_url: values.avatar_url,
              },
            });
            if (authError) {
              setError(`Auth error: ${authError.message || authError}`);
              return;
            }
            // Upsert to profiles table (ensure all columns exist in schema)
            const { error: profileError } = await supabase.from("profiles").upsert({
              id: user.id,
              email: values.email,
              full_name: values.full_name,
              avatar_url: values.avatar_url || "",
              contact_no: values.contact_no,
              grade_level: values.grade_level,
              date_of_birth: values.date_of_birth,
              updated_at: new Date().toISOString(),
            });
            if (profileError) {
              setError(`Profile error: ${profileError.message || profileError}`);
              return;
            }
            // Upsert to leaderboards table
            const { error: leaderboardError } = await supabase.from("leaderboards").upsert({
              user_id: user.id,
              username: values.username,
              avatar_url: values.avatar_url || "",
            });
            if (leaderboardError) {
              setError(`Leaderboard error: ${leaderboardError.message || leaderboardError}`);
              return;
            }
            // Insert notification
            const { error: notificationError } = await supabase.from("notifications").insert({
              user_id: user.id,
              title: "Profile Updated",
              message: "Your profile has been successfully updated!",
              type: "success",
            });
            if (notificationError) {
              setError(`Notification error: ${notificationError.message || notificationError}`);
              return;
            }
            setFormData({
              full_name: values.full_name,
              username: values.username,
              contact_no: values.contact_no,
              grade_level: values.grade_level,
              date_of_birth: values.date_of_birth,
              avatar_url: values.avatar_url || "",
            });
            await refreshUser();
            onProfileUpdate?.();
          } catch (error) {
            setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
          } finally {
            setLoading(false);
          }
        }}
      />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  )
}
