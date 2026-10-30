import { connectorStatus } from '@/lib/connectors/config'
import { ConnectionsPanel } from '@/components/connections-panel'
export const dynamic = 'force-dynamic'
export default function Settings() {
  return <ConnectionsPanel statuses={connectorStatus()} />
}
