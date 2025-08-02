import { Notice } from '../types/notice';

export interface NoticeRepository {
  save(notice: Notice): Promise<void>;
  saveBatch(notices: Notice[]): Promise<void>;
  findByUrl(url: string): Promise<Notice | null>;
  getRecent(limit: number): Promise<Notice[]>;
  getLastSyncDate(district: string): Promise<Date | null>;
  updateSyncDate(district: string, date: Date): Promise<void>;
  count(): Promise<number>;
  deleteOld(days: number): Promise<number>;
  hasNotices(district: string): Promise<boolean>;
} 