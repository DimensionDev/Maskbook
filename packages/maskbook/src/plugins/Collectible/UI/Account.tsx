import { useAccount } from '../../../web3/hooks/useAccount'
import { useI18N } from '../../../utils/i18n-next-ui'

export interface AccountProps {
    address?: string
    username?: string
}

export function Account({ address, username }: AccountProps) {
    const account = useAccount()
    const { t } = useI18N()

    return <>{account === address ? t('plugin_collectible_you') : username ?? address?.slice(2, 8)}</>
}
