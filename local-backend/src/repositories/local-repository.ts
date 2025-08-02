import Database from 'better-sqlite3';
import { Notice } from '../types/notice';
import { NoticeRepository } from './notice-repository';
import path from 'path';

export class LocalRepository implements NoticeRepository {
  private db: Database.Database;

  constructor(dbPath: string = 'data/local.db') {
    // 데이터 디렉토리 생성
    const dir = path.dirname(dbPath);
    require('fs').mkdirSync(dir, { recursive: true });

    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notices (
        id TEXT PRIMARY KEY,
        district TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        publishDate TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        category TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sync_status (
        district TEXT PRIMARY KEY,
        lastSyncDate TEXT NOT NULL,
        totalNotices INTEGER DEFAULT 0,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_notices_district ON notices(district);
      CREATE INDEX IF NOT EXISTS idx_notices_publishDate ON notices(publishDate);
      CREATE INDEX IF NOT EXISTS idx_notices_url ON notices(url);
    `);
  }

  async save(notice: Notice): Promise<void> {
    const id = notice.id || this.generateId(notice);
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO notices 
      (id, district, title, content, publishDate, url, category, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);


    stmt.run(
      id,
      notice.district,
      notice.title,
      notice.content || '',
      notice.publishDate,
      notice.url,
      notice.category || '',
    );
  }

  async saveBatch(notices: Notice[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO notices 
      (id, district, title, content, publishDate, url, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((notices: Notice[]) => {
      for (const notice of notices) {
        const id = notice.id || this.generateId(notice);
        stmt.run(
          id,
          notice.district,
          notice.title,
          notice.content || '',
          notice.publishDate,
          notice.url,
          notice.category || ''
        );
      }
    });

    transaction(notices);
  }

  async findByUrl(url: string): Promise<Notice | null> {
    const stmt = this.db.prepare('SELECT * FROM notices WHERE url = ?');
    const row = stmt.get(url);
    return row ? this.rowToNotice(row) : null;
  }

  async getRecent(limit: number): Promise<Notice[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM notices 
      ORDER BY publishDate DESC 
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    return rows.map(row => this.rowToNotice(row));
  }

  async getLastSyncDate(district: string): Promise<Date | null> {
    const stmt = this.db.prepare('SELECT lastSyncDate FROM sync_status WHERE district = ?');
    const row = stmt.get(district) as { lastSyncDate: string } | undefined;
    return row ? new Date(row.lastSyncDate) : null;
  }

  async updateSyncDate(district: string, date: Date): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO sync_status 
      (district, lastSyncDate, totalNotices, updatedAt)
      VALUES (?, ?, (SELECT COUNT(*) FROM notices WHERE district = ?), CURRENT_TIMESTAMP)
    `);
    stmt.run(district, date.toISOString(), district);
  }

  async count(): Promise<number> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM notices');
    const row = stmt.get() as { count: number } | undefined;
    return row ? row.count : 0;
  }

  async deleteOld(days: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const stmt = this.db.prepare('DELETE FROM notices WHERE publishDate < ?');
    const result = stmt.run(cutoffDate.toISOString());
    return result.changes;
  }

  async hasNotices(district: string): Promise<boolean> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM notices WHERE district = ?');
    const row = stmt.get(district) as { count: number } | undefined;
    return row ? row.count > 0 : false;
  }

  async getStatsByDistrict(): Promise<{district: string, count: number}[]> {
    const stmt = this.db.prepare(`
      SELECT district, COUNT(*) as count 
      FROM notices 
      GROUP BY district 
      ORDER BY count DESC
    `);
    return stmt.all() as { district: string; count: number }[];
  }

  async searchNotices(keyword: string, limit: number = 20): Promise<Notice[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM notices 
      WHERE title LIKE ? OR content LIKE ? 
      ORDER BY publishDate DESC 
      LIMIT ?
    `);
    const searchTerm = `%${keyword}%`;
    const rows = stmt.all(searchTerm, searchTerm, limit);
    return rows.map(row => this.rowToNotice(row));
  }

  async getNoticesByDateRange(startDate: string, endDate: string): Promise<Notice[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM notices 
      WHERE publishDate BETWEEN ? AND ? 
      ORDER BY publishDate DESC
    `);
    const rows = stmt.all(startDate, endDate);
    return rows.map(row => this.rowToNotice(row));
  }

  private generateId(notice: Notice): string {
    const crypto = require('crypto');
    return crypto.createHash('md5')
      .update(notice.url) // 오직 URL만 기준으로
      .digest('hex')
      .substring(0, 16);
  }

  private rowToNotice(row: any): Notice {
    return {
      id: row.id,
      district: row.district,
      title: row.title,
      content: row.content,
      publishDate: row.publishDate,
      url: row.url,
      category: row.category,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }

  close(): void {
    this.db.close();
  }
} 