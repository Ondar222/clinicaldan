import fs from "fs";
import path from "path";

const htmlPath = path.resolve(process.cwd(), "tmp/prodoctorov.html");
const jsonPath = path.resolve(process.cwd(), "src/data/prodoctorov.json");

function loadHtml(file) {
  return fs.readFileSync(file, "utf8");
}

function extractPhotos(html) {
  const results = [];
  // Roughly match each doctor card img with title/name and src
  const imgRe = /<img[^>]*?class="b-profile-card__img"[^>]*?>/g;
  const attrsRe = /([a-zA-Z0-9_:\-]+)=("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const tag = m[0];
    const attrs = {};
    let a;
    while ((a = attrsRe.exec(tag)) !== null) {
      const key = a[1];
      const val = a[3] ?? a[4] ?? "";
      attrs[key] = val;
    }
    const src = attrs["src"];
    const title = attrs["title"] || "";
    const alt = attrs["alt"] || "";
    if (src && (title || alt)) {
      const name = title || (alt.split(",")[0] || "").trim();
      const url = src.startsWith("http") ? src : `https://prodoctorov.ru${src}`;
      results.push({ name, url });
    }
  }
  return results;
}

function normalizeName(s) {
  return (s || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

function run() {
  if (!fs.existsSync(htmlPath)) {
    console.error("HTML not found:", htmlPath);
    process.exit(1);
  }
  if (!fs.existsSync(jsonPath)) {
    console.error("JSON not found:", jsonPath);
    process.exit(1);
  }
  const html = loadHtml(htmlPath);
  const photos = extractPhotos(html);
  const nameToPhoto = new Map(
    photos.map((p) => [normalizeName(p.name), p.url])
  );

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const updated = data.map((item) => {
    const key = normalizeName(item.fullName);
    const url = nameToPhoto.get(key);
    if (url) {
      return { ...item, photo: url };
    }
    return item;
  });

  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2), "utf8");
  console.log(
    `Updated ${updated.filter((i) => i.photo).length} photo links in prodoctorov.json`
  );
}

run();
