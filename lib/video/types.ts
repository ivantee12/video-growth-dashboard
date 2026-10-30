export const platforms = ['facebook', 'instagram', 'tiktok', 'xiaohongshu'] as const
export type Platform = typeof platforms[number]
export type ImportRow = {
  platform: Platform; account: string; video_id: string; title: string; category: string;
  url: string; published_at: string; captured_at: string; views: number;
}
export type Video = {
  id: string; platform: Platform; account: string; externalId: string; title: string;
  category: string; url: string; publishedAt: string;
  snapshots: { capturedAt: string; views: number; metric?: string; source?: string }[];
}
