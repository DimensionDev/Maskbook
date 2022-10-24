import type { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../utils/index.js'

export interface AccountProps {
    address?: string
    username?: string
}

export function Account({ address, username }: AccountProps) {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { t } = useI18N()

    return <>{isSameAddress(account, address ?? '') ? t('plugin_collectible_you') : username || address?.slice(2, 8)}</>
}
