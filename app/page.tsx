import { loadVideos } from '@/lib/video/db'
import { VideoDashboard } from '@/components/video-dashboard'
export const dynamic = 'force-dynamic'
export default async function Page() {
  try { return <VideoDashboard videos={await loadVideos()} /> }
  catch { return <VideoDashboard videos={[]} databaseError="Local database is not ready. Set DATABASE_URL and run npm run db:migrate. See README.md for Windows setup." /> }
}
