import { memo } from 'react'
import { Link, Typography } from '@mui/material'
import { MaskColorVar } from '@masknet/theme'
import { useNetworkDescriptors, useProviderDescriptor, useWeb3UI } from '@masknet/web3-hooks-base'
import { useSharedI18N } from '../../../../../index.js'

interface ChangeNetworkTipProps {
    chainId?: number
}

export const ChangeNetworkTip = memo<ChangeNetworkTipProps>(({ chainId }) => {
    const t = useSharedI18N()

    const providerDescriptor = useProviderDescriptor()
    const networkDescriptors = useNetworkDescriptors()
    const Web3UI = useWeb3UI()
    const { NetworkIconClickBait } = Web3UI.SelectNetworkMenu ?? {}
    const targetNetwork = networkDescriptors.find((x) => x.chainId === chainId)

    if (!chainId) return null

    return (
        <Typography component="span" sx={{ background: '#111432', color: MaskColorVar.white }} variant="body2">
            {t.wallets_assets_token_sent_not_connect_tip({
                chainName: targetNetwork?.name ?? 'Unknown Network',
            })}{' '}
            {NetworkIconClickBait && providerDescriptor && targetNetwork ? (
                <NetworkIconClickBait network={targetNetwork} provider={providerDescriptor}>
                    <Link
                        sx={{ cursor: 'pointer', color: MaskColorVar.white, textDecoration: 'underline' }}
                        onClick={() => {}}>
                        {t.wallets_assets_token_sent_switch_network_tip()}
                    </Link>
                </NetworkIconClickBait>
            ) : null}
        </Typography>
    )
})
