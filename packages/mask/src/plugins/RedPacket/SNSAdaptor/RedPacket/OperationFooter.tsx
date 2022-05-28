import { PluginWalletConnectIcon, SharedIcon } from '@masknet/icons'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId, useAccount, useChainIdValid } from '@masknet/web3-shared-evm'
import { Box, useTheme } from '@mui/material'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumChainBoundary } from '../../../../web3/UI/EthereumChainBoundary'
import { useI18N as useBaseI18n } from '../../../../utils'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import { useI18N } from '../../locales'
import { useStyles } from './useStyles'

interface OperationFooterProps {
    chainId?: ChainId
    canClaim: boolean
    canRefund: boolean
    isClaiming: boolean
    isRefunding: boolean
    onShare?(): void
    onClaimOrRefund: () => void | Promise<void>
}
export function OperationFooter({
    chainId,
    canClaim,
    canRefund,
    isClaiming,
    isRefunding,
    onShare,
    onClaimOrRefund,
}: OperationFooterProps) {
    const { classes } = useStyles()
    const { t: tr } = useBaseI18n()
    const t = useI18N()
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const theme = useTheme()

    // #region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    // #endregion

    const ObtainButton = () => {
        if (!canClaim && !canRefund) return null

        if (!account) {
            return (
                <ActionButton variant="contained" fullWidth onClick={openSelectProviderDialog}>
                    {tr('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            )
        }
        if (!chainIdValid) {
            return (
                <ActionButton disabled variant="contained" fullWidth>
                    {tr('plugin_wallet_invalid_network')}
                </ActionButton>
            )
        }
        const isLoading = isClaiming || isRefunding

        return (
            <ActionButton
                sx={{
                    backgroundColor: theme.palette.maskColor.dark,
                    width: '100%',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: theme.palette.maskColor.dark,
                    },
                }}
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                variant="contained"
                onClick={onClaimOrRefund}>
                {canClaim ? (isClaiming ? t.claiming() : t.claim()) : isRefunding ? t.refunding() : t.refund()}
            </ActionButton>
        )
    }

    return (
        <Box style={{ flex: 1, padding: 12 }}>
            <EthereumChainBoundary chainId={chainId ?? ChainId.Mainnet} renderInTimeline>
                <EthereumWalletConnectedBoundary
                    hideRiskWarningConfirmed
                    startIcon={<PluginWalletConnectIcon style={{ fontSize: 18 }} />}
                    renderInTimeline
                    classes={{
                        button: classes.walletButton,
                        walletBar: classes.walletBar,
                    }}>
                    <Box className={classes.footer}>
                        {canRefund ? null : (
                            <ActionButton
                                sx={{
                                    backgroundColor: theme.palette.maskColor.dark,
                                    color: theme.palette.maskColor.white,
                                    '&:hover': {
                                        backgroundColor: theme.palette.maskColor.dark,
                                    },
                                    padding: 1.125,
                                }}
                                fullWidth
                                startIcon={<SharedIcon style={{ fontSize: 18 }} />}
                                variant="contained"
                                onClick={onShare}>
                                {tr('share')}
                            </ActionButton>
                        )}
                        <ObtainButton />
                    </Box>
                </EthereumWalletConnectedBoundary>
            </EthereumChainBoundary>
        </Box>
    )
}
