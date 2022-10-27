import { useChainContext } from '@masknet/web3-hooks-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, keyframes, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useI18N as useBaseI18n } from '../../../../utils/index.js'
import { useI18N } from '../../locales/index.js'
import { ChainBoundary } from '@masknet/shared'
import { WalletConnectedBoundary } from '../../../../web3/UI/WalletConnectedBoundary.js'

export const useStyles = makeStyles()((theme) => {
    const spinningAnimationKeyFrames = keyframes`
to {
  transform: rotate(360deg)
}`
    return {
        footer: {
            width: '100%',
            display: 'flex',
            gap: theme.spacing(2),
            justifyContent: 'center',
            '& button': {
                flexBasis: 'auto',
            },
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                flexDirection: 'column',
                gap: theme.spacing(1),
            },
        },
    }
})

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
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
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
        if (!currentChainId) {
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
                    startIcon={<Icons.ConnectWallet size={18} />}
                    ActionButtonProps={{ variant: 'roundedDark' }}>
                    <Box className={classes.footer}>
                        {canRefund ? null : (
                            <ActionButton
                                fullWidth
                                variant="roundedDark"
                                startIcon={<Icons.Shared size={18} />}
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
