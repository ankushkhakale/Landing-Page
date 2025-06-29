"use client";

import React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: {
    full_name: string;
    username: string;
    email: string;
    contact_no: string;
    grade_level: string;
    date_of_birth: string;
    avatar_url?: string;
  };
  onSave: (values: {
    full_name: string;
    username: string;
    email: string;
    contact_no: string;
    grade_level: string;
    date_of_birth: string;
    avatar_url?: string;
  }) => void;
  userId: string;
}

export default function RuixenDialog({ open, onOpenChange, initialValues, onSave, userId }: ProfileDialogProps) {
  const [form, setForm] = useState(initialValues);
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatar_url || "https://github.com/shadcn.png");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Only reset form when dialog is opened
  useEffect(() => {
    if (open) {
      setForm(initialValues);
      setAvatarUrl(initialValues.avatar_url || "https://github.com/shadcn.png");
    }
  }, [open, initialValues]);

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleThumbnailClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) {
        setError('File upload error: ' + uploadError.message);
        setUploading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      setForm((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      setError("Error uploading avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...form, avatar_url: avatarUrl });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(initialValues);
    setAvatarUrl(initialValues.avatar_url || "https://github.com/shadcn.png");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="px-6 py-4 h-36 w-full" style={{ background: "radial-gradient(circle, rgba(238, 174, 202, 1) 0%, rgba(148, 187, 233, 1) 100%)" }} />
          <div className="-mt-14 flex justify-center w-full">
            <div className="relative flex flex-col items-center justify-center">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg rounded-full mx-auto">
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <button
                onClick={handleThumbnailClick}
                className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 border-2 border-white"
                aria-label="Change profile picture"
                disabled={uploading}
                style={{ zIndex: 2 }}
              >
                {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ImagePlus size={20} />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                disabled={uploading}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto px-6 py-6 space-y-4 w-full flex flex-col items-center justify-center">
          <form className="space-y-4 w-full max-w-lg mx-auto" onSubmit={e => e.preventDefault()}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={form.full_name} onChange={e => handleInputChange("full_name", e.target.value)} required />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="username">User Name</Label>
                <Input id="username" value={form.username} onChange={e => handleInputChange("username", e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={e => handleInputChange("email", e.target.value)} required disabled />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="contact_no">Contact No.</Label>
                <Input id="contact_no" value={form.contact_no} onChange={e => handleInputChange("contact_no", e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Input id="grade_level" value={form.grade_level} onChange={e => handleInputChange("grade_level", e.target.value)} />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="date_of_birth">Date Of Birth</Label>
                <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={e => handleInputChange("date_of_birth", e.target.value)} />
              </div>
            </div>
          </form>
        </div>
        <div className="flex justify-end w-full gap-2 border-t border-border px-6 py-4 bg-background rounded-b-2xl">
          {error && <div className="text-red-500 text-sm mr-auto">{error}</div>}
          <Button variant="outline" onClick={handleCancel} disabled={uploading || saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={uploading || saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProfileAvatar({ userId }: { userId: string }) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
        setAvatarUrl(data?.avatar_url || null);
      }
    };
    fetchProfile();
  }, [userId, supabase]);

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Optional: show local preview
    setAvatarUrl(URL.createObjectURL(file));
    const publicUrl = await uploadAvatar(file);
    if (publicUrl) {
      // Save public URL to profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);
      if (updateError) {
        alert("Error saving avatar URL to profile: " + updateError.message);
        console.error(updateError);
      } else {
        setAvatarUrl(publicUrl);
      }
    } else if (error) {
      alert("Upload error: " + error);
    }
  };

  return (
    <div>
      <img
        src={avatarUrl || "/placeholder.svg"}
        alt="Profile"
        style={{ width: 96, height: 96, borderRadius: "50%" }}
        onClick={() => fileInputRef.current?.click()}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={useAvatarUploadUploading}
      />
      {useAvatarUploadUploading && <div>Uploading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button onClick={() => fileInputRef.current?.click()} disabled={useAvatarUploadUploading}>
        Change Photo
      </button>
    </div>
  );
} 