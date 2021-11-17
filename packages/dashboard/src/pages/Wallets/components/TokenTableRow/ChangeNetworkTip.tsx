import { memo, useCallback } from 'react'
import {
    ChainId,
    getNetworkTypeFromChainId,
    NetworkType,
    ProviderType,
    useAccount,
    useWeb3StateContext,
} from '@masknet/web3-shared-evm'
import { safeUnreachable } from '@dimensiondev/kit'
import { Link, Typography } from '@mui/material'
import { PluginMessages, PluginServices } from '../../../../API'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useDashboardI18N } from '../../../../locales'
import { MaskColorVar } from '@masknet/theme'

interface ChangeNetworkTipProps {
    chainId: ChainId
}

export const ChangeNetworkTip = memo<ChangeNetworkTipProps>(({ chainId }) => {
    const t = useDashboardI18N()
    const account = useAccount()
    const { providerType } = useWeb3StateContext()

    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.connectWalletDialogUpdated,
    )

    const onChainChange = useCallback(
        async (chainId: ChainId) => {
            switch (providerType) {
                case ProviderType.MaskWallet:
                    await PluginServices.Wallet.updateAccount({
                        account,
                        chainId,
                        providerType: ProviderType.MaskWallet,
                    })
                    await PluginServices.Wallet.updateMaskAccount({
                        account,
                        chainId,
                    })
                    break
                case ProviderType.MetaMask:
                case ProviderType.WalletConnect:
                case ProviderType.Injected:
                    setConnectWalletDialog({
                        open: true,
                        providerType,
                        networkType: getNetworkTypeFromChainId(chainId) ?? NetworkType.Ethereum,
                    })
                    break
                case ProviderType.CustomNetwork:
                    throw new Error('To be implemented.')
                default:
                    safeUnreachable(providerType)
            }
        },
        [providerType, account],
    )
    return (
        <Typography component="span" sx={{ background: '#111432', color: MaskColorVar.white }} variant="body2">
            {t.wallets_assets_token_sent_not_connect_tip({
                chainName: getNetworkTypeFromChainId(chainId, true) ?? 'Unknown Network',
            })}{' '}
            <Link
                sx={{ cursor: 'pointer', color: MaskColorVar.white, textDecoration: 'underline' }}
                onClick={() => onChainChange(chainId)}>
                {t.wallets_assets_token_sent_switch_network_tip()}
            </Link>
        </Typography>
    )
})
