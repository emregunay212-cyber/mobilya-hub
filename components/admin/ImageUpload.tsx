"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  token: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  maxImages?: number;
}

export default function ImageUpload({
  token,
  images,
  onChange,
  folder = "products",
  maxImages = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`En fazla ${maxImages} gorsel yuklenebilir`);
      return;
    }

    setUploading(true);
    setError("");
    const newImages = [...images];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'i gecemez");
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          newImages.push(data.url);
        } else {
          setError(data.error || "Yukleme hatasi");
        }
      } catch {
        setError("Baglanti hatasi");
      }
    }

    onChange(newImages);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function moveImage(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= images.length) return;
    const arr = [...images];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onChange(arr);
  }

  return (
    <div>
      {/* Upload area */}
      <div
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
        style={{ borderColor: "#2A2D37", background: "#0F1117" }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        {uploading ? (
          <p className="text-sm" style={{ color: "#6366F1" }}>Yukleniyor...</p>
        ) : (
          <div>
            <p className="text-sm mb-1" style={{ color: "#9CA3AF" }}>
              Gorsel yuklemek icin tiklayin veya surukleyin
            </p>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              JPEG, PNG, WebP, GIF - Maks 5MB - {images.length}/{maxImages}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs mt-2" style={{ color: "#EF4444" }}>{error}</p>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={img}
                alt=""
                className="w-20 h-20 rounded-lg object-cover"
                style={{ border: idx === 0 ? "2px solid #6366F1" : "2px solid #2A2D37" }}
              />
              {idx === 0 && (
                <span
                  className="absolute bottom-0 left-0 right-0 text-center text-[10px] py-0.5 rounded-b-lg"
                  style={{ background: "#6366F1", color: "#fff" }}
                >
                  Kapak
                </span>
              )}
              <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    className="w-5 h-5 rounded text-[10px] text-white flex items-center justify-center"
                    style={{ background: "#6366F1" }}
                  >
                    ←
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    className="w-5 h-5 rounded text-[10px] text-white flex items-center justify-center"
                    style={{ background: "#6366F1" }}
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="w-5 h-5 rounded text-[10px] text-white flex items-center justify-center"
                  style={{ background: "#EF4444" }}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
