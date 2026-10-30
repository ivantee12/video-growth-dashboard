import type { Platform } from '@/lib/video/types'
export function PlatformLogo({platform,size=32}:{platform:Platform;size?:number}) {
  const common={width:size,height:size,viewBox:'0 0 32 32',role:'img','aria-label':`${platform} logo`,className:'shrink-0 rounded-lg'}
  if(platform==='facebook') return <svg {...common}><rect width="32" height="32" rx="8" fill="#0866ff"/><path fill="white" d="M18.5 28V17.1h3.7l.6-4.3h-4.3V10c0-1.2.4-2.1 2.1-2.1H23V4.1c-.5-.1-2-.2-3.5-.2-3.5 0-5.9 2.1-5.9 6v2.9H10v4.3h3.6V28z"/></svg>
  if(platform==='instagram') return <svg {...common}><rect width="32" height="32" rx="8" fill="#c13584"/><rect x="6" y="6" width="20" height="20" rx="6" fill="none" stroke="white" strokeWidth="2.2"/><circle cx="16" cy="16" r="5" fill="none" stroke="white" strokeWidth="2.2"/><circle cx="22" cy="10" r="1.4" fill="white"/></svg>
  if(platform==='tiktok') return <svg {...common}><rect width="32" height="32" rx="8" fill="#111"/><path d="M19 7v13a5 5 0 1 1-4-4.9M19 7c0 4 3 6 6 6" fill="none" stroke="#25f4ee" strokeWidth="3.5" transform="translate(-1 1)"/><path d="M19 7v13a5 5 0 1 1-4-4.9M19 7c0 4 3 6 6 6" fill="none" stroke="#fe2c55" strokeWidth="3.5" transform="translate(1)"/><path d="M19 7v13a5 5 0 1 1-4-4.9M19 7c0 4 3 6 6 6" fill="none" stroke="white" strokeWidth="2"/></svg>
  return <svg {...common}><rect width="32" height="32" rx="8" fill="#ff2442"/><text x="16" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Arial, sans-serif">小红书</text></svg>
}
