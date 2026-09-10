/**
 * Besin değerleri etiket ŞABLONU.
 *
 * Bu dosya YALNIZCA satır adlarını (besin öğesi isimleri) ve birimleri içerir —
 * hiçbir sayısal değer içermez. Değerler, resmî ürün etiketi tarafımıza
 * iletildikten sonra `Product.nutrition` üzerinden doldurulur ve şablondaki
 * ilgili satıra yerleşir. Uydurma değer gösterilmez.
 */

export interface NutritionLabelRow {
  /** `Product.nutrition[].label` ile eşleşen ad. */
  label: string;
  unit: string;
  /** Alt kırılım satırı (girintili gösterilir). */
  indented?: boolean;
}

export interface NutritionLabelSection {
  id: string;
  title: string;
  rows: NutritionLabelRow[];
}

export const nutritionLabelTemplate: NutritionLabelSection[] = [
  {
    id: "energy",
    title: "Enerji",
    rows: [
      { label: "Enerji", unit: "kJ / kcal" },
      { label: "Nem", unit: "g" },
    ],
  },
  {
    id: "macros",
    title: "Makro besin öğeleri",
    rows: [
      { label: "Protein", unit: "g" },
      { label: "Kazein / Whey oranı", unit: "%", indented: true },
      { label: "Yağ", unit: "g" },
      { label: "Doymuş yağ", unit: "g", indented: true },
      { label: "Linoleik asit (LA)", unit: "mg", indented: true },
      { label: "Alfa-linolenik asit (ALA)", unit: "mg", indented: true },
      { label: "DHA", unit: "mg", indented: true },
      { label: "ARA", unit: "mg", indented: true },
      { label: "Karbonhidrat", unit: "g" },
      { label: "Laktoz", unit: "g", indented: true },
      { label: "Lif", unit: "g" },
      { label: "GOS", unit: "g", indented: true },
      { label: "FOS", unit: "g", indented: true },
    ],
  },
  {
    id: "minerals",
    title: "Mineraller",
    rows: [
      { label: "Sodyum", unit: "mg" },
      { label: "Potasyum", unit: "mg" },
      { label: "Klorür", unit: "mg" },
      { label: "Kalsiyum", unit: "mg" },
      { label: "Fosfor", unit: "mg" },
      { label: "Magnezyum", unit: "mg" },
      { label: "Demir", unit: "mg" },
      { label: "Çinko", unit: "mg" },
      { label: "Bakır", unit: "µg" },
      { label: "Manganez", unit: "µg" },
      { label: "İyot", unit: "µg" },
      { label: "Selenyum", unit: "µg" },
    ],
  },
  {
    id: "vitamins",
    title: "Vitaminler",
    rows: [
      { label: "Vitamin A", unit: "µg RE" },
      { label: "Vitamin D", unit: "µg" },
      { label: "Vitamin E", unit: "mg α-TE" },
      { label: "Vitamin K", unit: "µg" },
      { label: "Vitamin C", unit: "mg" },
      { label: "Tiamin (B1)", unit: "mg" },
      { label: "Riboflavin (B2)", unit: "mg" },
      { label: "Niasin (B3)", unit: "mg" },
      { label: "Pantotenik asit (B5)", unit: "mg" },
      { label: "Vitamin B6", unit: "mg" },
      { label: "Folik asit", unit: "µg" },
      { label: "Vitamin B12", unit: "µg" },
      { label: "Biotin", unit: "µg" },
    ],
  },
  {
    id: "others",
    title: "Diğer bileşenler",
    rows: [
      { label: "Nükleotidler", unit: "mg" },
      { label: "Lutein", unit: "µg" },
      { label: "Kolin", unit: "mg" },
      { label: "İnositol", unit: "mg" },
      { label: "Taurin", unit: "mg" },
      { label: "L-karnitin", unit: "mg" },
      { label: "Bifidobacterium lactis", unit: "kob" },
    ],
  },
];

/** Şablondaki toplam satır sayısı (arayüzde bilgi amaçlı gösterilir). */
export const nutritionLabelRowCount = nutritionLabelTemplate.reduce(
  (total, section) => total + section.rows.length,
  0,
);
