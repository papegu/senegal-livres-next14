export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  description?: string;
  status?: 'available' | 'pending';
  eBook?: boolean;
}
