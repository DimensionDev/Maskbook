import { memo } from 'react'
import { Link, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../../locales'
import { MaskColorVar } from '@masknet/theme'
import { useNetworkDescriptors, useProviderDescriptor, useWeb3UI, Web3Helper } from '@masknet/plugin-infra/web3'

interface ChangeNetworkTipProps {
    chainId?: number
}

export const ChangeNetworkTip = memo<ChangeNetworkTipProps>(({ chainId }) => {
    const t = useDashboardI18N()

    const providerDescriptor = useProviderDescriptor() as Web3Helper.ProviderDescriptorAll
    const networkDescriptors = useNetworkDescriptors() as Web3Helper.NetworkDescriptorAll[]
    const Web3UI = useWeb3UI() as Web3Helper.Web3UIAll
    const { NetworkIconClickBait } = Web3UI.SelectNetworkMenu ?? {}
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
