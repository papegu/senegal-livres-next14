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
}
