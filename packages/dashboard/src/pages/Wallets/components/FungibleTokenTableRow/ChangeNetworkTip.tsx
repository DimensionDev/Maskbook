import { memo } from 'react'
import { Link, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../../locales'
import { MaskColorVar } from '@masknet/theme'
import { useNetworkDescriptors, useProviderDescriptor, useWeb3UI } from '@masknet/plugin-infra'

interface ChangeNetworkTipProps {
    chainId?: number
}

export const ChangeNetworkTip = memo<ChangeNetworkTipProps>(({ chainId }) => {
    const t = useDashboardI18N()

    const providerDescriptor = useProviderDescriptor()
    const { NetworkIconClickBait } = useWeb3UI().SelectNetworkMenu ?? {}
    const networkDescriptors = useNetworkDescriptors()
    const targetNetwork = networkDescriptors.find((x) => x.chainId === chainId)

    if (!chainId) return null

    return (
        <Typography component="span" sx={{ background: '#111432', color: MaskColorVar.white }} variant="body2">
            {t.wallets_assets_token_sent_not_connect_tip({
                chainName: targetNetwork?.name ?? 'Unknown Network',
            })}{' '}
            {NetworkIconClickBait && providerDescriptor && targetNetwork && (
                <NetworkIconClickBait network={targetNetwork} provider={providerDescriptor}>
                    <Link
                        sx={{ cursor: 'pointer', color: MaskColorVar.white, textDecoration: 'underline' }}
                        onClick={() => {}}>
                        {t.wallets_assets_token_sent_switch_network_tip()}
                    </Link>
                </NetworkIconClickBait>
            )}
        </Typography>
    )
})
