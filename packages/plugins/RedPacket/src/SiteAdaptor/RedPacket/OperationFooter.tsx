import type { MouseEventHandler } from 'react'
import { useChainContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, type BoxProps } from '@mui/material'
import { Icons } from '@masknet/icons'
import { ChainBoundary, WalletConnectedBoundary, SelectProviderModal } from '@masknet/shared'
import { Trans, useLingui } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => {
    return {
        footer: {
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
        actionButton: {
            backgroundColor: theme.palette.maskColor.dark,
            width: '100%',
            color: 'white',
            '&:hover': {
                backgroundColor: theme.palette.maskColor.dark,
            },
        },
    }
})

interface OperationFooterProps extends BoxProps {
    chainId?: ChainId
    canClaim: boolean
    canRefund: boolean
    /** If the conditions are not satisfied */
    unsatisfied?: boolean
    isClaimed?: boolean
    /** Is claiming or checking claim status */
    isClaiming: boolean
    isRefunding: boolean
    onClaimOrRefund: () => void | Promise<void>
}
export function OperationFooter({
    chainId,
    canClaim,
    canRefund,
    unsatisfied,
    isClaimed,
    isClaiming,
    isRefunding,
    onClaimOrRefund,
    ...rest
}: OperationFooterProps) {
    const { t } = useLingui()
    const { classes, cx } = useStyles()
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId })

    if (isClaimed) return null
    if (!canClaim && !canRefund && account) return null

    function getObtainButton(onClick: MouseEventHandler<HTMLButtonElement>) {
        if (!account) {
            return (
                <ActionButton fullWidth onClick={() => SelectProviderModal.open()} variant="roundedDark">
                    <Trans>Connect Wallet</Trans>
                </ActionButton>
            )
        }
        if (!canClaim && !canRefund) return null
        if (!currentChainId) {
            return (
                <ActionButton disabled fullWidth variant="roundedDark">
                    <Trans>Invalid Network</Trans>
                </ActionButton>
            )
        }
        const isLoading = isClaiming || isRefunding

        return (
            <ActionButton
                className={classes.actionButton}
                variant="roundedDark"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                onClick={onClick}>
                {unsatisfied ?
                    <>
                        <Trans>Who can claim</Trans>
                        <Icons.Questions size={18} />
                    </>
                : canClaim ?
                    isClaiming ?
                        <Trans>Claiming...</Trans>
                    :   <Trans>Claim</Trans>
                : isRefunding ?
                    <Trans>Refunding</Trans>
                :   <Trans>Refund</Trans>}
            </ActionButton>
        )
    }

    return (
        <Box {...rest} className={cx(classes.footer, rest.className)}>
            <ChainBoundary
                expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                expectedChainId={(chainId as ChainId) ?? ChainId.Mainnet}
                ActionButtonPromiseProps={{ variant: 'roundedDark' }}>
                <WalletConnectedBoundary
                    noGasText={t`Insufficient Balance`}
                    hideRiskWarningConfirmed
                    expectedChainId={chainId ?? ChainId.Mainnet}
                    startIcon={<Icons.Wallet size={18} />}
                    ActionButtonProps={{ variant: 'roundedDark' }}>
                    {getObtainButton(onClaimOrRefund)}
                </WalletConnectedBoundary>
            </ChainBoundary>
        </Box>
    )
}
