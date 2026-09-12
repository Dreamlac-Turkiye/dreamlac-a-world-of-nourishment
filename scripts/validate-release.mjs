import { existsSync, readFileSync } from "node:fs";

for (const path of ["public/robots.txt", "public/sitemap.xml", "public/favicon.png"]) {
  if (!existsSync(path)) throw new Error(`Missing public asset: ${path}`);
}

for (const route of [
  "arama",
  "bilgi-merkezi",
  "hakkimizda",
  "kalite-ve-guvenlik",
  "iletisim",
  "sikca-sorulan-sorular",
  "siparis-takip",
  "teslimat-politikasi",
  "iade-ve-iptal-politikasi",
  "on-bilgilendirme-formu",
  "uyelik-sozlesmesi",
  "ticari-elektronik-ileti-onayi",
]) {
  const source = readFileSync(`src/routes/${route}.tsx`, "utf8");
  if (source.includes("PagePlaceholder") || source.includes("tasarlanacaktır")) {
    throw new Error(`Incomplete public route: ${route}`);
  }
}

const sitemap = readFileSync("public/sitemap.xml", "utf8");
for (const route of ["/urunler", "/hakkimizda", "/kalite-ve-guvenlik", "/iletisim"]) {
  if (!sitemap.includes(route)) throw new Error(`Sitemap route missing: ${route}`);
}

if (!readFileSync("src/data/mock/products.ts", "utf8").includes(".webp")) {
  throw new Error("Optimized product images are not wired");
}

console.log("Release validation passed.");
