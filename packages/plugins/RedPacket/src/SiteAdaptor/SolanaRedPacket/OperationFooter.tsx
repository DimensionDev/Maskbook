import type { MouseEventHandler } from 'react'
import { useChainContext, useNativeTokenBalance } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-solana'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, useTheme, type BoxProps } from '@mui/material'
import { Icons } from '@masknet/icons'
import { ChainBoundary, WalletConnectedBoundary, SelectProviderModal } from '@masknet/shared'
import { Trans, useLingui } from '@lingui/react/macro'
import { isGreaterThan } from '@masknet/web3-shared-base'
import { SOL_REDPACKET_CREATE_DEFAULT_GAS } from '../../constants.js'

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
    isExpired: boolean
    onClaimOrRefund: () => void | Promise<void>
}
export function OperationFooter({
    chainId,
    canClaim,
    canRefund,
    isClaiming,
    isExpired,
    onClaimOrRefund,
    ...rest
}: OperationFooterProps) {
    const { t } = useLingui()
    const { classes, cx } = useStyles()
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_SOLANA>({ chainId })
    const theme = useTheme()

    const { value: nativeTokenBalance } = useNativeTokenBalance()

    if (isExpired) return null
    if (!canClaim && !canRefund && account) return null

    function getObtainButton(onClick: MouseEventHandler<HTMLButtonElement>) {
        if (!account) {
            return (
                <ActionButton fullWidth onClick={() => SelectProviderModal.open()} variant="roundedDark">
                    <Trans>Connect Wallet</Trans>
                </ActionButton>
            )
        }
        if (nativeTokenBalance && isGreaterThan(SOL_REDPACKET_CREATE_DEFAULT_GAS, nativeTokenBalance))
            return (
                <ActionButton fullWidth disabled variant="roundedDark">
                    <Trans>Insufficient Balance for Gas Fee</Trans>
                </ActionButton>
            )
        if (!canClaim && !canRefund) return null
        if (!currentChainId) {
            return (
                <ActionButton disabled fullWidth variant="roundedDark">
                    <Trans>Invalid Network</Trans>
                </ActionButton>
            )
        }
        const isLoading = isClaiming

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
                :   null}
            </ActionButton>
        )
    }

    return (
        <Box {...rest} className={cx(classes.footer, rest.className)}>
            <ChainBoundary
                expectedPluginID={NetworkPluginID.PLUGIN_SOLANA}
                expectedChainId={chainId ?? ChainId.Mainnet}
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
