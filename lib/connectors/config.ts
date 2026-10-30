export const apiPlatforms = ['facebook','instagram','tiktok'] as const
export type ApiPlatform = typeof apiPlatforms[number]
export type ConnectorConfig = {platform: ApiPlatform; accountId: string; token: string; version: string}
const keys = {
  facebook: ['FB_PAGE_ID','FB_PAGE_ACCESS_TOKEN'],
  instagram: ['IG_ACCOUNT_ID','IG_ACCESS_TOKEN'],
  tiktok: ['TIKTOK_OPEN_ID','TIKTOK_ACCESS_TOKEN'],
} as const
export function connectorStatus(env: Record<string,string|undefined> = process.env) {
  return apiPlatforms.map(platform => {
    const missing = keys[platform].filter(key => !env[key]?.trim()) as string[]
    if (platform !== 'tiktok' && !/^v\d+\.0$/.test(env.META_GRAPH_VERSION ?? '')) missing.push('META_GRAPH_VERSION')
    const accountId = env[keys[platform][0]]?.trim() ?? ''
    if (accountId && (platform === 'tiktok' ? !/^[\w.-]{1,200}$/.test(accountId) : !/^\d{1,100}$/.test(accountId))) missing.push(`${keys[platform][0]} (invalid ID)`)
    return {platform, configured:missing.length===0, accountId, missing}
  })
}
export function getConnectorConfig(platform: ApiPlatform, env: Record<string,string|undefined> = process.env): ConnectorConfig {
  const status = connectorStatus(env).find(s=>s.platform===platform)!
  if (!status.configured) throw new Error(`Configure ${status.missing.join(', ')} in .env.local and restart the app.`)
  return {platform,accountId:status.accountId,token:env[keys[platform][1]]!.trim(),version:env.META_GRAPH_VERSION ?? ''}
}
