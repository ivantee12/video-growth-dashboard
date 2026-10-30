import { z } from 'zod'
export class ConnectorError extends Error {
  constructor(message:string, public status=502) { super(message) }
}
export type Fetcher = typeof fetch
export async function apiJson(url: URL, token:string, fetcher:Fetcher, body?:unknown): Promise<unknown> {
  // Never send tokens to pagination URLs supplied by an API response.
  if (url.protocol!=='https:' || !['graph.facebook.com','open.tiktokapis.com'].includes(url.hostname)) throw new ConnectorError('Unsupported API host.')
  let response: Response
  try {
    response=await fetcher(url,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${token}`,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000)})
  } catch { throw new ConnectorError('The platform could not be reached. Try again later.') }
  let data:unknown
  try { data=await response.json() } catch { throw new ConnectorError('The platform returned an invalid response.') }
  if (response.status===401 || response.status===403) throw new ConnectorError('Authorization was rejected. Check token expiry, account access and approved permissions.',401)
  if (response.status===429) throw new ConnectorError('Platform rate limit reached. Wait before syncing again.',429)
  const errors=z.object({error:z.object({code:z.union([z.string(),z.number()]).optional()}).optional()}).safeParse(data)
  const code=errors.success ? errors.data.error?.code : undefined
  if (code!==undefined && code!=='ok') {
    if ([4,17,32,613,'rate_limit_exceeded'].includes(code)) throw new ConnectorError('Platform rate limit reached. Wait before syncing again.',429)
    if ([190,102,'access_token_invalid','access_token_expired'].includes(code)) throw new ConnectorError('The token is invalid or expired. Replace it in .env.local and restart the app.',401)
    throw new ConnectorError('The platform rejected the request. Check permissions, account type, Graph version and metric availability. No snapshots were saved.')
  }
  if (!response.ok) throw new ConnectorError('The platform request failed. Check the account configuration and approved API access.')
  return data
}
export function validated<T>(schema:z.ZodType<T>, value:unknown): T {
  const result=schema.safeParse(value)
  if (!result.success) throw new ConnectorError('The platform response was incomplete or changed. No snapshots were saved.')
  return result.data
}
export const viewCount=z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)
export const safeLink=z.string().url().refine(v=>new URL(v).protocol==='https:' || new URL(v).protocol==='http:')
