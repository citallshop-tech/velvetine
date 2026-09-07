import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const RELATIONSHIP_INTENTS = ["SERIOUS", "CASUAL", "FRIENDSHIP", "NOT_SURE"];
const BODY_TYPES = ["SLIM", "ATHLETIC", "AVERAGE", "CURVY", "MUSCULAR", "PLUS_SIZE"];
const HAIR_COLORS = ["BLONDE", "BROWN", "BLACK", "RED", "GRAY", "OTHER"];
const GENDERS = ["WOMAN", "MAN", "NONBINARY", "OTHER"];

function parseEnumArray(value: unknown, validValues: string[]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && validValues.includes(v));
}

/**
 * True partial update: a field is only touched if its key is actually
 * present in the request body. Two separate forms on the same page (the
 * "about you" section and the hidden preferences section) each save
 * independently without this route wiping out whichever one wasn't part
 * of the current request.
 */
export async function PATCH(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Inte inloggad." }, { status: 401 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if ("bio" in body) {
    data.bio = typeof body.bio === "string" ? body.bio.slice(0, 500) : null;
  }
  if ("heightCm" in body) {
    data.heightCm =
      typeof body.heightCm === "number" && body.heightCm > 0 && body.heightCm < 260
        ? Math.round(body.heightCm)
        : null;
  }
  if ("occupation" in body) {
    data.occupation =
      typeof body.occupation === "string" ? body.occupation.trim().slice(0, 100) || null : null;
  }
  if ("relationshipIntent" in body) {
    data.relationshipIntent = RELATIONSHIP_INTENTS.includes(body.relationshipIntent)
      ? body.relationshipIntent
      : null;
  }
  if ("bodyType" in body) {
    data.bodyType = BODY_TYPES.includes(body.bodyType) ? body.bodyType : null;
  }
  if ("hairColor" in body) {
    data.hairColor = HAIR_COLORS.includes(body.hairColor) ? body.hairColor : null;
  }
  if ("locationCity" in body) {
    data.locationCity =
      typeof body.locationCity === "string" ? body.locationCity.trim().slice(0, 100) || null : null;
  }
  if ("locationCountry" in body) {
    data.locationCountry =
      typeof body.locationCountry === "string" ? body.locationCountry.trim().slice(0, 100) || null : null;
  }
  if ("gender" in body && GENDERS.includes(body.gender)) {
    data.gender = body.gender;
  }
  if ("seekingGender" in body) {
    const seeking = parseEnumArray(body.seekingGender, GENDERS);
    if (seeking.length > 0) {
      data.seekingGender = seeking;
    }
  }
  if ("prefHeightMin" in body) {
    data.prefHeightMin =
      typeof body.prefHeightMin === "number" && body.prefHeightMin > 0 && body.prefHeightMin < 260
        ? Math.round(body.prefHeightMin)
        : null;
  }
  if ("prefHeightMax" in body) {
    data.prefHeightMax =
      typeof body.prefHeightMax === "number" && body.prefHeightMax > 0 && body.prefHeightMax < 260
        ? Math.round(body.prefHeightMax)
        : null;
  }
  if ("prefBodyTypes" in body) {
    data.prefBodyTypes = parseEnumArray(body.prefBodyTypes, BODY_TYPES);
  }
  if ("prefHairColors" in body) {
    data.prefHairColors = parseEnumArray(body.prefHairColors, HAIR_COLORS);
  }

  await prisma.user.update({ where: { id: userId }, data });

  return NextResponse.json({ ok: true });
}
