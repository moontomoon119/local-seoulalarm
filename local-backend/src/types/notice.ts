export interface Notice {
  id?: string;
  district: string;
  title: string;
  content: string;
  publishDate: string;
  url: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoticeListItem {
  title: string;
  url: string;
  publishDate: string;
  category?: string;
} 