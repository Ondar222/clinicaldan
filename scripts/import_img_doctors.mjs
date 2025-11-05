import fs from "fs";
import path from "path";

const root = process.cwd();
const imagesDir = path.resolve(root, "public/img_doctors");
const jsonPath = path.resolve(root, "src/data/prodoctorov.json");

function normalizeName(s) {
  return (s || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

function splitNameAndSpecialty(basename) {
  // Remove extension
  const nameOnly = basename.replace(/\.[^.]+$/i, "");
  // Prefer delimiter of hyphen followed by a space, which we expect between name and specialty
  const candidates = [];
  const idx1 = nameOnly.lastIndexOf(" - ");
  if (idx1 !== -1) candidates.push(idx1);
  const idx2 = nameOnly.lastIndexOf("- ");
  if (idx2 !== -1) candidates.push(idx2);
  // If not found, try space–dash without space after (rare), else failover
  const idx3 = nameOnly.lastIndexOf(" -");
  if (idx3 !== -1) candidates.push(idx3);

  let splitIdx = -1;
  if (candidates.length > 0) {
    // choose the rightmost plausible delimiter
    splitIdx = Math.max(...candidates);
  }

  if (splitIdx === -1) {
    // Fallback: cannot reliably split, treat the entire string as full name
    return { fullName: nameOnly.trim(), specialty: "" };
  }

  const fullName = nameOnly
    .slice(0, splitIdx)
    .trim()
    .replace(/[\-\s]+$/, "");
  const specialty = nameOnly
    .slice(splitIdx + (nameOnly[splitIdx + 1] === " " ? 2 : 1))
    .trim()
    .replace(/^[-\s]+/, "");
  return { fullName, specialty };
}

function loadJson(file) {
  const raw = fs.readFileSync(file, "utf8");
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  throw new Error("Unexpected JSON format for prodoctorov.json");
}

function saveJson(file, list) {
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
}

function main() {
  if (!fs.existsSync(imagesDir)) {
    console.error("Images directory not found:", imagesDir);
    process.exit(1);
  }
  if (!fs.existsSync(jsonPath)) {
    console.error("JSON not found:", jsonPath);
    process.exit(1);
  }

  const entries = fs
    .readdirSync(imagesDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name));

  const existing = loadJson(jsonPath);
  const byName = new Map(existing.map((i) => [normalizeName(i.fullName), i]));

  let added = 0;
  let updatedPhotos = 0;
  const results = [...existing];

  for (const filename of entries) {
    const { fullName, specialty } = splitNameAndSpecialty(filename);
    if (!fullName) continue;
    const key = normalizeName(fullName);
    const photoPath = `/img_doctors/${filename}`;

    if (!byName.has(key)) {
      results.push({
        fullName: fullName,
        specialty: specialty || "Врач",
        photo: photoPath,
      });
      byName.set(key, results[results.length - 1]);
      added++;
    } else {
      const item = byName.get(key);
      // Update photo only if absent or placeholder
      const hasNoPhoto = !item.photo || /no-avatar\.svg$/i.test(item.photo);
      if (hasNoPhoto) {
        item.photo = photoPath;
        updatedPhotos++;
      }
      // Optionally update specialty if missing
      if (
        (!item.specialty || String(item.specialty).trim() === "") &&
        specialty
      ) {
        item.specialty = specialty;
      }
    }
  }

  // Sort by fullName for stability
  results.sort((a, b) => a.fullName.localeCompare(b.fullName, "ru"));
  saveJson(jsonPath, results);
  console.log(
    `Processed ${entries.length} images. Added ${added} new doctors, updated ${updatedPhotos} photos.`
  );
}

main();
