export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  description?: string;
  status?: 'available' | 'pending';
  eBook?: boolean;
  pdfFile?: string; // URL ou path au fichier PDF
  pdfFileName?: string; // Nom du fichier PDF
  // Nouvelles colonnes (Cloudflare / SEO)
  slug?: string;
  cover_image_url?: string;
  pdf_r2_key?: string;
  pdf_r2_url?: string;
  has_ebook?: boolean;
}
