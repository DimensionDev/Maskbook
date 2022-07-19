import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, useTheme } from '@mui/material'
import { SharedIcon, WalletConnect } from '@masknet/icons'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N as useBaseI18n } from '../../../../utils'
import { useI18N } from '../../locales'
import { ChainBoundary } from '../../../../web3/UI/ChainBoundary'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary'
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
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainIdValid = useChainId(NetworkPluginID.PLUGIN_EVM)
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
                <ActionButton fullWidth onClick={openSelectProviderDialog} variant="roundedDark">
                    {tr('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            )
        }
        if (!chainIdValid) {
            return (
                <ActionButton disabled fullWidth variant="roundedDark">
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
                variant="roundedDark"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                onClick={onClaimOrRefund}>
                {canClaim ? (isClaiming ? t.claiming() : t.claim()) : isRefunding ? t.refunding() : t.refund()}
            </ActionButton>
        )
    }

    return (
        <Box style={{ flex: 1, padding: 12 }}>
            <ChainBoundary
                expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                expectedChainId={chainId ?? ChainId.Mainnet}
                ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                <WalletConnectedBoundary
                    hideRiskWarningConfirmed
                    startIcon={<WalletConnect style={{ fontSize: 18 }} />}
                    ActionButtonProps={{ variant: 'roundedDark' }}>
                    <Box className={classes.footer}>
                        {canRefund ? null : (
                            <ActionButton
                                fullWidth
                                variant="roundedDark"
                                startIcon={<SharedIcon style={{ fontSize: 18 }} />}
                                onClick={onShare}>
                                {tr('share')}
                            </ActionButton>
                        )}
                        <ObtainButton />
                    </Box>
                </WalletConnectedBoundary>
            </ChainBoundary>
        </Box>
    )
}
