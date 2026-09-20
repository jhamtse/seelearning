"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import Papa from "papaparse";
import {
  addPublication,
  createPerson,
  deletePerson,
  deletePublication,
  setPersonPhoto,
  updatePerson,
  type LocationType,
  type PersonInput,
} from "@/lib/people";

const LOCATION_TYPES: LocationType[] = ["local", "domestic", "international"];

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function readPersonForm(formData: FormData): PersonInput {
  const locationType = formData.get("locationType");
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    affiliation: (formData.get("affiliation") as string) || null,
    title: (formData.get("title") as string) || null,
    locationType: LOCATION_TYPES.includes(locationType as LocationType)
      ? (locationType as LocationType)
      : "domestic",
    bio: (formData.get("bio") as string) || null,
    notes: (formData.get("notes") as string) || null,
    tags: parseTags(formData.get("tags")),
  };
}

async function savePhotoIfPresent(personId: string, formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn(
      "Skipping photo upload: BLOB_READ_WRITE_TOKEN is not set. " +
        "Connect a Vercel Blob store to enable photo uploads."
    );
    return;
  }

  const blob = await put(`photos/${personId}-${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  await setPersonPhoto(personId, blob.url);
}

export async function createPersonAction(formData: FormData) {
  const input = readPersonForm(formData);
  if (!input.name) {
    throw new Error("Name is required");
  }
  const id = await createPerson(input);
  await savePhotoIfPresent(id, formData);
  revalidatePath("/people");
  redirect(`/people/${id}`);
}

export async function updatePersonAction(id: string, formData: FormData) {
  const input = readPersonForm(formData);
  if (!input.name) {
    throw new Error("Name is required");
  }
  await updatePerson(id, input);
  await savePhotoIfPresent(id, formData);
  revalidatePath("/people");
  revalidatePath(`/people/${id}`);
  redirect(`/people/${id}`);
}

export async function deletePersonAction(id: string) {
  await deletePerson(id);
  revalidatePath("/people");
  redirect("/people");
}

export async function addPublicationAction(personId: string, formData: FormData) {
  const title = String(formData.get("pubTitle") ?? "").trim();
  if (!title) return;
  await addPublication(personId, {
    title,
    url: (formData.get("pubUrl") as string) || null,
    year: (formData.get("pubYear") as string) || null,
  });
  revalidatePath(`/people/${personId}`);
}

export async function deletePublicationAction(personId: string, pubId: string) {
  await deletePublication(pubId);
  revalidatePath(`/people/${personId}`);
}

export type ImportResult = {
  created: number;
  skipped: number;
  errors: string[];
};

const FIELD_ALIASES: Record<string, keyof PersonInput | "tags"> = {
  name: "name",
  "full name": "name",
  email: "email",
  "email address": "email",
  phone: "phone",
  "phone number": "phone",
  affiliation: "affiliation",
  institution: "affiliation",
  organization: "affiliation",
  title: "title",
  role: "title",
  "job title": "title",
  location: "locationType",
  "location type": "locationType",
  bio: "bio",
  notes: "notes",
  tags: "tags",
  "field of expertise": "tags",
  expertise: "tags",
};

function normalizeLocationType(raw: string | undefined): LocationType {
  const v = (raw ?? "").trim().toLowerCase();
  if (v.startsWith("local")) return "local";
  if (v.startsWith("inter")) return "international";
  return "domestic";
}

export async function importCsvAction(
  _prevState: ImportResult | null,
  formData: FormData
): Promise<ImportResult> {
  const file = formData.get("csv");
  const result: ImportResult = { created: 0, skipped: 0, errors: [] };
  if (!(file instanceof File) || file.size === 0) {
    result.errors.push("No file uploaded.");
    return result;
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    result.errors.push(
      ...parsed.errors.slice(0, 5).map((e) => `Row ${e.row ?? "?"}: ${e.message}`)
    );
  }

  for (const [index, row] of parsed.data.entries()) {
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.trim().toLowerCase();
      const field = FIELD_ALIASES[normalizedKey];
      if (field && value) mapped[field] = value;
    }

    const name = mapped.name?.trim();
    if (!name) {
      result.skipped++;
      result.errors.push(`Row ${index + 2}: missing a name, skipped.`);
      continue;
    }

    try {
      await createPerson({
        name,
        email: mapped.email ?? null,
        phone: mapped.phone ?? null,
        affiliation: mapped.affiliation ?? null,
        title: mapped.title ?? null,
        locationType: normalizeLocationType(mapped.locationType),
        bio: mapped.bio ?? null,
        notes: mapped.notes ?? null,
        tags: mapped.tags ? mapped.tags.split(/[,;]/).map((t) => t.trim()).filter(Boolean) : [],
      });
      result.created++;
    } catch (err) {
      result.skipped++;
      result.errors.push(`Row ${index + 2}: ${(err as Error).message}`);
    }
  }

  revalidatePath("/people");
  return result;
}
