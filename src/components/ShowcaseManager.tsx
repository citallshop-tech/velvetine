"use client";

import { useState, FormEvent, useRef } from "react";
import { useTranslations } from "next-intl";

export interface ShowcaseItemData {
  id: string;
  category: string;
  name: string;
  description: string | null;
  photoUrl?: string | null;
}

export const CATEGORIES = ["CAR", "BOAT", "PLANE", "PROPERTY", "PET", "OTHER"] as const;
export const CATEGORY_LABEL_KEYS: Record<(typeof CATEGORIES)[number], string> = {
  CAR: "categoryCar",
  BOAT: "categoryBoat",
  PLANE: "categoryPlane",
  PROPERTY: "categoryProperty",
  PET: "categoryPet",
  OTHER: "categoryOther",
};

const MAX_ITEMS = 6;

function ItemPhotoUpload({
  item,
  onChange,
}: {
  item: ShowcaseItemData;
  onChange: (url: string) => void;
}) {
  const t = useTranslations("Showcase");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/profile/showcase/${item.id}/photo`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (res.ok) {
      onChange(data.photoUrl);
    }
  }

  return (
    <label className="text-xs text-gold hover:text-gold-bright cursor-pointer shrink-0">
      {uploading ? t("uploadingPhoto") : item.photoUrl ? t("changePhoto") : t("addPhoto")}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
    </label>
  );
}

export function ShowcaseManager({
  items,
  onItemsChange,
}: {
  items: ShowcaseItemData[];
  onItemsChange: (items: ShowcaseItemData[]) => void;
}) {
  const t = useTranslations("Showcase");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("CAR");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function addItem(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || adding) return;

    setAdding(true);
    setError(null);
    const res = await fetch("/api/profile/showcase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, name, description }),
    });
    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      setError(data.error ?? "Något gick fel.");
      return;
    }

    onItemsChange([...items, data.item]);
    setName("");
    setDescription("");
  }

  async function removeItem(id: string) {
    setRemovingId(id);
    await fetch(`/api/profile/showcase/${id}`, { method: "DELETE" });
    onItemsChange(items.filter((i) => i.id !== id));
    setRemovingId(null);
  }

  function updateItemPhoto(id: string, url: string) {
    onItemsChange(items.map((i) => (i.id === id ? { ...i, photoUrl: url } : i)));
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-border rounded-sm bg-surface px-4 py-3 flex items-center gap-4"
          >
            {item.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- external Blob URLs, not local assets
              <img
                src={item.photoUrl}
                alt=""
                className="w-12 h-12 rounded-sm object-cover shrink-0 border border-border"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-ivory text-sm">
                {t(CATEGORY_LABEL_KEYS[item.category as (typeof CATEGORIES)[number]])} — {item.name}
              </p>
              {item.description && <p className="text-xs text-ivory-muted">{item.description}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <ItemPhotoUpload item={item} onChange={(url) => updateItemPhoto(item.id, url)} />
              <button
                disabled={removingId === item.id}
                onClick={() => removeItem(item.id)}
                className="text-xs text-ivory-muted hover:text-gold-bright disabled:opacity-50"
              >
                {t("remove")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length >= MAX_ITEMS ? (
        <p className="text-xs text-ivory-muted">{t("maxReached")}</p>
      ) : (
        <form onSubmit={addItem} className="flex flex-col gap-3 border border-border rounded-sm bg-surface p-4">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
              className="bg-ink border border-border rounded-sm px-3 py-2 text-sm text-ivory"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(CATEGORY_LABEL_KEYS[c])}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={60}
              className="bg-ink border border-border rounded-sm px-3 py-2 text-sm text-ivory placeholder:text-ivory-muted/50"
            />
          </div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            maxLength={200}
            className="bg-ink border border-border rounded-sm px-3 py-2 text-sm text-ivory placeholder:text-ivory-muted/50"
          />
          {error && <p className="text-xs text-gold-bright">{error}</p>}
          <button
            type="submit"
            disabled={adding || !name.trim()}
            className="self-start px-4 py-2 rounded-sm text-sm border border-gold text-ivory hover:bg-surface-raised disabled:opacity-50"
          >
            {adding ? t("adding") : t("add")}
          </button>
        </form>
      )}
    </div>
  );
}
