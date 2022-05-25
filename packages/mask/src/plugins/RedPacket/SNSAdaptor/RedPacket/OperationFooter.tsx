import { PluginWalletConnectIcon, SharedIcon } from '@masknet/icons'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ChainId, useAccount, useChainIdValid } from '@masknet/web3-shared-evm'
import { Box, useTheme } from '@mui/material'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'
import { EthereumChainBoundary } from '../../../../web3/UI/EthereumChainBoundary'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
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
    const { t } = useI18N()
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
                    {t('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            )
        }
        if (!chainIdValid) {
            return (
                <ActionButton disabled variant="contained" fullWidth>
                    {t('plugin_wallet_invalid_network')}
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
                {canClaim
                    ? isClaiming
                        ? t('plugin_red_packet_claiming')
                        : t('plugin_red_packet_claim')
                    : isRefunding
                    ? t('plugin_red_packet_refunding')
                    : t('plugin_red_packet_refund')}
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
                                {t('share')}
                            </ActionButton>
                        )}
                        <ObtainButton />
                    </Box>
                </EthereumWalletConnectedBoundary>
            </EthereumChainBoundary>
        </Box>
    )
}
