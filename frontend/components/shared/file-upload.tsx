"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useUploadDocument } from "@/lib/hooks";

interface FileUploadProps {
  ownerType: "USER" | "APPLICATION" | "LOAN" | "BORROWER";
  ownerId: string;
  documentType: string;
  accept?: string;
  maxSizeMB?: number;
  onSuccess?: (documentId: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function FileUpload({
  ownerType,
  ownerId,
  documentType,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  onSuccess,
  onError,
  disabled = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFile = (file: File) => {
    if (file.size > maxSizeBytes) {
      onError?.(new Error(`File size must be less than ${maxSizeMB}MB`));
      return;
    }
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMutation.mutateAsync({
        ownerType,
        ownerId,
        type: documentType,
        file: selectedFile,
      });
      onSuccess?.(result.id);
      setSelectedFile(null);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="text-4xl mb-2">📁</div>
        <p className="font-medium">
          {selectedFile ? selectedFile.name : "Drag & drop or click to upload"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {accept.split(",").join(", ")} (max {maxSizeMB}MB)
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFile(null)}
              disabled={uploadMutation.isPending}
            >
              Remove
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
