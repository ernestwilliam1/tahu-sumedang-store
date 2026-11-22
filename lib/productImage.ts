/** Maps product.name -> local file in public/images/ */
const LOCAL_IMAGE_MAP: Record<string, string> = {
  "Tahu Sumedang Besek Tradisional": "/images/Tahu Sumedang Besek Tradisional.jpg",
  "Tahu Super Renyah Besek Puas": "/images/Tahu Super Renyah Besek Puas.jpg",
  "Tahu Mercon Rawit Merah Nampol": "/images/Tahu Mercon Rawit Merah Nampol.webp",
  "Tahu Walik Krispy Sambal Petis": "/images/Tahu Walik Krispy Sambal Petis.jpg",
  "Tahu Gejrot Pedas Segar": "/images/Tahu Gejrot Pedas Segar.jpg",
  "Tahu Frozen Vakum Pack": "/images/Tahu Frozen Vakum Pack.jpg",
  "Sambal Kecap Rawit Bawang": "/images/Sambal Kecap Rawit Bawang.jpg",
  "Hampers Besek Anyaman Istimewa": "/images/Hampers Besek Anyaman Istimewa.jpg",
};

export function getProductImageUrl(product: { name: string; image: string | null }): string {
  // Prefer local mapping if name matches
  const mapped = LOCAL_IMAGE_MAP[product.name];
  if (mapped) return encodeURI(mapped);
  // If image is already a local /images path, keep it (encode)
  if (product.image?.startsWith("/images/")) return encodeURI(product.image);
  // Fallback to mapped or original url (for legacy unsplash) or placeholder empty
  if (product.image) return product.image;
  return "";
}

export function getProductImageMap() {
  return LOCAL_IMAGE_MAP;
}
