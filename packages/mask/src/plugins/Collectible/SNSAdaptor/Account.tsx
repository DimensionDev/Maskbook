import { useI18N } from '../../../utils'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useAccount } from '@masknet/plugin-infra/web3'

export interface AccountProps {
    address?: string
    username?: string
}

export function Account({ address, username }: AccountProps) {
    const { t } = useI18N()
    const account = useAccount()

    return <>{isSameAddress(account, address ?? '') ? t('plugin_collectible_you') : username || address?.slice(2, 8)}</>
}
