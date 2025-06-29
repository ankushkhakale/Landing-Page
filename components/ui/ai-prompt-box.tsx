"use client"

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUp, Paperclip, Square, X, Globe, BrainCog, FolderCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from '@/lib/supabase-client';
import { RadialProgress } from "@/components/ui/radial-progress";
import { AIMoodRadar } from "@/components/ui/ai-mood-radar";
import { LearningInsights } from "@/components/ui/learning-insights";
import { GoalTracker } from "@/components/ui/goal-tracker";
import { CommandPalette } from "@/components/ui/command-palette";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble";
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "@/components/ui/chat-input";

// Dynamic import for pdfjs-dist to avoid SSR issues
let pdfjsLib: any = null;
if (typeof window !== 'undefined') {
  import('pdfjs-dist').then((module) => {
    pdfjsLib = module;
  });
}

// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-transparent hover:scrollbar-thumb-[#555555]",
      className
    )}
    ref={ref}
    rows={1}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// Tooltip Components
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Dialog Components
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#333333] bg-[#1F2023] p-0 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-[#2E3033]/80 p-2 hover:bg-[#2E3033] transition-all">
        <X className="h-5 w-5 text-gray-200 hover:text-white" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-gray-100", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white hover:bg-white/80 text-black",
      outline: "border border-[#444444] bg-transparent hover:bg-[#3A3A40]",
      ghost: "bg-transparent hover:bg-[#3A3A40]",
    };
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-8 w-8 rounded-full aspect-[1/1]",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ImageViewDialog Component
interface ImageViewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}
const ImageViewDialog: React.FC<ImageViewDialogProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] md:max-w-[800px]">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-[#1F2023] rounded-2xl overflow-hidden shadow-2xl"
        >
          <img
            src={imageUrl}
            alt="Full preview"
            className="w-full max-h-[80vh] object-contain rounded-2xl"
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// PromptInput Context and Components
interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});
function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context) throw new Error("usePromptInput must be used within a PromptInput");
  return context;
}

interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
      onDragOver,
      onDragLeave,
      onDrop,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };
    return (
      <TooltipProvider>
        <PromptInputContext.Provider
          value={{
            isLoading,
            value: value ?? internalValue,
            setValue: onValueChange ?? handleChange,
            maxHeight,
            onSubmit,
            disabled,
          }}
        >
          <div
            ref={ref}
            className={cn(
              "rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300",
              isLoading && "border-red-500/70",
              className
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  }
);
PromptInput.displayName = "PromptInput";

interface PromptInputTextareaProps {
  disableAutosize?: boolean;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}
const PromptInputTextarea: React.FC<PromptInputTextareaProps & React.ComponentProps<typeof Textarea>> = ({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholder,
  ...props
}) => {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn("text-base", className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
};

interface PromptInputActionsProps extends React.HTMLAttributes<HTMLDivElement> {}
const PromptInputActions: React.FC<PromptInputActionsProps> = ({ children, className, ...props }) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}) => {
  const { disabled } = usePromptInput();
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

// Custom Divider Component
const CustomDivider: React.FC = () => (
  <div className="relative h-6 w-[1.5px] mx-1">
    <div
      className="absolute inset-0 bg-gradient-to-t from-transparent via-[#9b87f5]/70 to-transparent rounded-full"
      style={{
        clipPath: "polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%)",
      }}
    />
  </div>
);

// Main PromptInputBox Component
export interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}
export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>((props, ref) => {
  const { onSend = () => {}, isLoading = false, placeholder = "Type your message here...", className } = props;
  const [input, setInput] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [filePreviews, setFilePreviews] = React.useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [showSearch, setShowSearch] = React.useState(false);
  const [showThink, setShowThink] = React.useState(false);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);
  const promptBoxRef = React.useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      content:
        "Hi there! I'm BrainBuddy, your AI study companion! 🎓 I'm here to help you learn, answer questions, and make studying fun! What would you like to learn about today? ✨",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleToggleChange = (value: string) => {
    if (value === "search") {
      setShowSearch((prev) => !prev);
      setShowThink(false);
    } else if (value === "think") {
      setShowThink((prev) => !prev);
      setShowSearch(false);
    }
  };

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const processFile = (file: File) => {
    setFiles([file]);
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string });
      reader.readAsDataURL(file);
    } else {
      setFilePreviews({});
    }
  };

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFile(files[0]);
  }, []);

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove && filePreviews[fileToRemove.name]) setFilePreviews({});
    setFiles([]);
  };

  const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl);

  const handlePaste = React.useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const file = items[i].getAsFile();
      if (file) {
        e.preventDefault();
        processFile(file);
        break;
      }
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener("paste", handlePaste as any);
      return () => document.removeEventListener("paste", handlePaste as any);
    }
  }, [handlePaste]);

  const handleSubmit = async () => {
    if (input.trim() || files.length > 0) {
      let messagePrefix = "";
      if (showSearch) messagePrefix = "[Search: ";
      else if (showThink) messagePrefix = "[Think: ";
      const formattedInput = messagePrefix ? `${messagePrefix}${input}]` : input;
      if (files.length > 0) {
        setUploading(true);
        try {
          const file = files[0];
          const supabase = createClient();
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `chat-attachments/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(filePath, file, { upsert: true });
          if (uploadError) {
            alert('File upload error: ' + uploadError.message);
            setUploading(false);
            return;
          } else {
            const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
            let extractedText = '';
            if (file.type.startsWith('image/')) {
              extractedText = '[Image OCR not implemented in this demo]';
            } else if (file.type === 'application/pdf') {
              if (pdfjsLib) {
                const pdf = await pdfjsLib.getDocument(publicUrl).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const content = await page.getTextContent();
                  text += content.items.map((item: any) => item.str).join(' ');
                }
                extractedText = text;
              } else {
                extractedText = '[PDF processing not available]';
              }
            } else if (file.type.startsWith('text/')) {
              extractedText = await file.text();
            } else if (file.type.startsWith('video/')) {
              extractedText = '[Video file attached. Preview available, but content not extracted.]';
            } else {
              extractedText = '[File type not supported for reading]';
            }
            let aiResponseText = extractedText;
            if (aiResponseText.length > 200) aiResponseText = aiResponseText.slice(0, 200) + '...';
            onSend(`${formattedInput}\nAttachment text: ${extractedText}\n[Attachment](${publicUrl})`, [file]);
            setInput("");
            setFiles([]);
            setFilePreviews({});
          }
        } catch (error) {
          alert('Error uploading file: ' + error);
          setUploading(false);
        } finally {
          setUploading(false);
        }
      } else {
        onSend(formattedInput, []);
        setInput("");
        setFiles([]);
        setFilePreviews({});
      }
    }
  };

  const hasContent = input.trim() !== "" || files.length > 0;

  return (
    <>
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className={cn(
          "w-full bg-[#1F2023] border-[#444444] shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 ease-in-out",
          className
        )}
        disabled={isLoading || uploading}
        ref={ref || promptBoxRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 p-0 pb-1 transition-all duration-300">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith('image/') && filePreviews[file.name] ? (
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                    onClick={() => openImageModal(filePreviews[file.name])}
                  >
                    <img
                      src={filePreviews[file.name]}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : file.type.startsWith('video/') && filePreviews[file.name] ? (
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                    onClick={() => openImageModal(filePreviews[file.name])}
                  >
                    <video
                      src={filePreviews[file.name]}
                      className="h-full w-full object-cover"
                      controls
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                    <Paperclip className="w-4 h-4 text-gray-300" />
                    <span className="text-xs text-gray-200">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      className="text-xs text-gray-200 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            "transition-all duration-300",
            isLoading ? "h-0 overflow-hidden opacity-0" : "opacity-100"
          )}
        >
          <PromptInputTextarea
            placeholder={
              showSearch
                ? "Search the web..."
                : showThink
                ? "Think deeply..."
                : placeholder
            }
            className="text-base"
          />
        </div>

        <PromptInputActions className="flex items-center justify-between gap-2 p-0 pt-2">
          <div
            className={cn(
              "flex items-center gap-1 transition-opacity duration-300",
              isLoading ? "opacity-0 invisible h-0" : "opacity-100 visible"
            )}
          >
            <PromptInputAction tooltip="Upload image">
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="flex h-8 w-8 text-[#9CA3AF] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-600/30 hover:text-[#D1D5DB]"
                disabled={isLoading || uploading}
              >
                <Paperclip className="h-5 w-5 transition-colors" />
                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
                    if (e.target) e.target.value = "";
                  }}
                />
              </button>
            </PromptInputAction>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange("search")}
                className={cn(
                  "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                  showSearch
                    ? "bg-[#1EAEDB]/15 border-[#1EAEDB] text-[#1EAEDB]"
                    : "bg-transparent border-transparent text-[#9CA3AF] hover:text-[#D1D5DB]"
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ rotate: showSearch ? 360 : 0, scale: showSearch ? 1.1 : 1 }}
                    whileHover={{ rotate: showSearch ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  >
                    <Globe className={cn("w-4 h-4", showSearch ? "text-[#1EAEDB]" : "text-inherit")} />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap text-[#1EAEDB] flex-shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <CustomDivider />

              <button
                type="button"
                onClick={() => handleToggleChange("think")}
                className={cn(
                  "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                  showThink
                    ? "bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#8B5CF6]"
                    : "bg-transparent border-transparent text-[#9CA3AF] hover:text-[#D1D5DB]"
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ rotate: showThink ? 360 : 0, scale: showThink ? 1.1 : 1 }}
                    whileHover={{ rotate: showThink ? 360 : 15, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  >
                    <BrainCog className={cn("w-4 h-4", showThink ? "text-[#8B5CF6]" : "text-inherit")} />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showThink && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap text-[#8B5CF6] flex-shrink-0"
                    >
                      Think
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          <PromptInputAction
            tooltip={
              isLoading
                ? "Stop generation"
                : hasContent
                ? "Send message"
                : "Voice message"
            }
          >
            <Button
              variant="default"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                isLoading
                  ? "bg-transparent hover:bg-gray-600/30 text-red-500 hover:text-red-400"
                  : hasContent
                  ? "bg-white hover:bg-white/80 text-[#1F2023]"
                  : "bg-transparent hover:bg-gray-600/30 text-[#9CA3AF] hover:text-[#D1D5DB]"
              )}
              onClick={() => {
                if (hasContent) handleSubmit();
              }}
              disabled={isLoading && !hasContent}
            >
              {isLoading ? (
                <Square className="h-4 w-4 fill-[#1F2023] animate-pulse" />
              ) : hasContent ? (
                <ArrowUp className="h-4 w-4 text-[#1F2023]" />
              ) : null}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>

      <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background-color: #444444;
          border-radius: 3px;
        }
        textarea::-webkit-scrollbar-thumb:hover {
          background-color: #555555;
        }
      `}</style>
    </>
  );
});
PromptInputBox.displayName = "PromptInputBox";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function AIChatBox({ user, mode }: { user?: any; mode?: 'teach' | 'chat' }) {
  // Set initial message and system prompt based on mode
  const initialTeachMsg: Message = {
    id: "1",
    content:
      "Hi! I'm your AI student. Please explain a concept or topic to me, and I'll listen, ask questions, and summarize what I learn!",
    sender: "ai",
    timestamp: new Date(),
  };
  const initialChatMsg: Message = {
    id: "1",
    content:
      "Hi there! I'm BrainBuddy, your AI study companion! 🎓 I'm here to help you learn, answer questions, and make studying fun! What would you like to learn about today? ✨",
    sender: "ai",
    timestamp: new Date(),
  };
  const [messages, setMessages] = useState<Message[]>([
    mode === 'teach' ? initialTeachMsg : initialChatMsg
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (input: string, files?: File[]) => {
    setError(null); // Clear previous error
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user?.id,
          mode: mode || 'chat',
        }),
      });
      const data = await response.json();
      let aiResponseText = "Sorry, I'm having trouble responding right now. Please try again! 😅";
      if (data.success) {
        aiResponseText = data.response;
        if (aiResponseText.length > 200) aiResponseText = aiResponseText.slice(0, 200) + '...';
      } else {
        setError("AI failed to respond. Please try again later.");
        console.error("Chat API error:", data.error);
      }
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          mode === 'teach'
            ? "I'm having trouble connecting right now, but I'm ready to learn from you! Try explaining a concept to me."
            : "I'm having trouble connecting right now, but I'm here to help! Try asking me something about your studies! 😊",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput(""); // Always clear input
    }
  };

  // Helper functions for attachments
  function extractAttachment(content: string) {
    const match = content.match(/\[Attachment\]\(([^)]+)\)/);
    return match ? match[1] : null;
  }
  function isImageUrl(url: string) {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  }
  function isPdfUrl(url: string) {
    return url.match(/\.pdf$/i);
  }
  function isVideoUrl(url: string) {
    return url.match(/\.(mp4|webm|ogg)$/i);
  }

  if (mode === 'teach') {
    // Professional chat UI for the new container with dark gradient background
    return (
      <div className="w-full h-full flex flex-col bg-transparent">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={
                    message.sender === "user"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                      : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                  }
                  fallback={message.sender === "user" ? "US" : "AI"}
                />
                <ChatBubbleMessage
                  variant={message.sender === "user" ? "sent" : "received"}
                >
                  <div className={`${message.sender === "user" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-slate-800/90 text-gray-100"} rounded-2xl p-4 shadow-xl backdrop-blur-sm border ${message.sender === "user" ? "border-blue-400/30" : "border-slate-600/30"}`}>
                    {message.content.replace(/\n\[Attachment\]\([^)]+\)/, "")}
                    <span className={`block text-xs mt-1 text-right ${message.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </ChatBubbleMessage>
              </ChatBubble>
            ))}
            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </div>
        
        {/* Input Area */}
        <div className="flex-shrink-0 p-6 border-t border-slate-700/50 bg-slate-900/30 backdrop-blur-md">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!input.trim()) return;
              sendMessage(input);
              setInput("");
            }}
            className="relative rounded-xl border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:border-blue-400/50 p-2 shadow-lg"
          >
            <ChatInput
              value={input}
              onChange={e => setInput(e.target.value)}
              onSubmit={() => {
                if (!input.trim()) return;
                sendMessage(input);
                setInput("");
              }}
              className="min-h-12 resize-none rounded-lg bg-transparent border-0 p-3 shadow-none focus-visible:ring-0"
            >
              <ChatInputTextArea
                placeholder="Ask me anything about your studies..."
                className="bg-transparent border-0 text-white placeholder-slate-400"
              />
              <div className="flex items-center p-3 pt-0 justify-end">
                <ChatInputSubmit className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg rounded-lg" />
              </div>
            </ChatInput>
          </form>
          {error && (
            <div className="text-red-300 text-xs mt-2 text-center bg-red-500/20 rounded-lg p-2 backdrop-blur-sm border border-red-500/30">{error}</div>
          )}
        </div>
      </div>
    );
  }

  // Original Chat tab UI (light card layout)
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)]">
      <div className="w-full md:w-1/2 h-full flex items-center justify-center">
        <div className="border-0 shadow-xl h-[600px] w-full md:w-[500px] flex flex-col rounded-2xl bg-white/5">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-2xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">BrainBuddy AI</h3>
              <p className="text-blue-100 text-sm">Your AI Study Companion</p>
            </div>
          </div>
          <div className="flex-1 p-0 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-4">
              {messages.map((message) => {
                const attachmentUrl = extractAttachment(message.content);
                return (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback
                        className={
                          message.sender === "ai"
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        }
                      >
                        {message.sender === "ai" ? (
                          <Brain className="w-4 h-4" />
                        ) : (
                          user?.user_metadata?.full_name?.charAt(0) || "U"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-md rounded-2xl p-4 ${
                        message.sender === "ai"
                          ? "bg-blue-50 text-gray-800"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content.replace(/\n\[Attachment\]\([^)]+\)/, "")}
                      </p>
                      {attachmentUrl && (
                        isImageUrl(attachmentUrl) ? (
                          <img src={attachmentUrl} alt="attachment" className="mt-2 max-w-xs rounded-lg" />
                        ) : isPdfUrl(attachmentUrl) ? (
                          <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-blue-600 underline">View PDF</a>
                        ) : isVideoUrl(attachmentUrl) ? (
                          <video controls src={attachmentUrl} className="mt-2 max-w-xs rounded-lg" />
                        ) : (
                          <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-blue-600 underline">Download Attachment</a>
                        )
                      )}
                      <p className={`text-xs mt-2 ${message.sender === "ai" ? "text-gray-500" : "text-purple-100"}`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      <Brain className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 animate-spin border-2 border-blue-500 border-t-transparent rounded-full inline-block" />
                      <span className="text-sm text-gray-600">BrainBuddy is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <div className="p-6 border-t border-gray-200 bg-white/5">
              <PromptInputBox
                onSend={sendMessage}
                isLoading={isLoading}
                placeholder="Ask me anything about your studies..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}