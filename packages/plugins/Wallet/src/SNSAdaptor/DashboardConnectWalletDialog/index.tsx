import { useDashboardSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { ConnectWalletDialog } from '../ConnectWalletDialog/index.js'

export function DashboardConnectWalletDialog() {
    const { pluginIDSettings } = useDashboardSNSAdaptorContext()

    return <ConnectWalletDialog pluginIDSettings={pluginIDSettings} />
}
