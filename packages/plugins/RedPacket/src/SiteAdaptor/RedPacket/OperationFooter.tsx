import type { MouseEventHandler } from 'react'
import { useChainContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, useTheme, type BoxProps } from '@mui/material'
import { Icons } from '@masknet/icons'
import { ChainBoundary, WalletConnectedBoundary, SelectProviderModal } from '@masknet/shared'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    }
})

interface OperationFooterProps extends BoxProps {
    chainId?: ChainId
    canClaim: boolean
    canRefund: boolean
    /** Is claiming or checking claim status */
    isClaiming: boolean
    isRefunding: boolean
    onClaimOrRefund: () => void | Promise<void>
}
export function OperationFooter({
    chainId,
    canClaim,
    canRefund,
    isClaiming,
    isRefunding,
    onClaimOrRefund,
    ...rest
}: OperationFooterProps) {
    const { _ } = useLingui()
    const { classes, cx } = useStyles()
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId })
    const theme = useTheme()

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
                onClick={onClick}>
                {canClaim ?
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
                    noGasText={_(msg`Insufficient Balance`)}
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
