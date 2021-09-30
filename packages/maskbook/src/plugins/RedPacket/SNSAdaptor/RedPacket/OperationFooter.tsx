import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared'
import { TransactionState, TransactionStateType, useAccount, useChainIdValid } from '@masknet/web3-shared'
import { Box } from '@material-ui/core'
import { useCallback } from 'react'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import { useStyles } from './useStyles'

interface OperationFooterProps {
    canClaim: boolean
    canRefund: boolean
    claimState: TransactionState
    refundState: TransactionState
    shareLink?: string
    onClaimOrRefund: () => void | Promise<void>
}
export function OperationFooter({
    canClaim,
    canRefund,
    claimState,
    refundState,
    shareLink,
    onClaimOrRefund,
}: OperationFooterProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const account = useAccount()
    const chainIdValid = useChainIdValid()

    //#region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    const canClaimOrRefund = canClaim || canRefund

    const handleShare = useCallback(() => {
        if (!shareLink) return
        window.open(shareLink, '_blank', 'noopener noreferrer')
    }, [shareLink])

    return (
        <EthereumWalletConnectedBoundary
            classes={{
                connectWallet: classes.connectWallet,
            }}>
            <Box className={classes.footer}>
                <ActionButton variant="contained" fullWidth onClick={handleShare}>
                    {t('share')}
                </ActionButton>
                {canClaimOrRefund &&
                    (!account ? (
                        <ActionButton variant="contained" fullWidth size="large" onClick={openSelectProviderDialog}>
                            {t('plugin_wallet_connect_a_wallet')}
                        </ActionButton>
                    ) : !chainIdValid ? (
                        <ActionButton disabled variant="contained" fullWidth size="large">
                            {t('plugin_wallet_invalid_network')}
                        </ActionButton>
                    ) : (
                        <ActionButton
                            fullWidth
                            disabled={
                                claimState.type === TransactionStateType.HASH ||
                                refundState.type === TransactionStateType.HASH
                            }
                            variant="contained"
                            size="large"
                            onClick={onClaimOrRefund}>
                            {canClaim
                                ? claimState.type === TransactionStateType.HASH
                                    ? t('plugin_red_packet_claiming')
                                    : t('plugin_red_packet_claim')
                                : refundState.type === TransactionStateType.HASH
                                ? t('plugin_red_packet_refunding')
                                : t('plugin_red_packet_refund')}
                        </ActionButton>
                    ))}
            </Box>
        </EthereumWalletConnectedBoundary>
    )
}
