import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { ChainBoundary, WalletConnectedBoundary } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Box, type BoxProps } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
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
    button: {
        backgroundColor: theme.palette.maskColor.dark,
        color: theme.palette.common.white,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        margin: '0 !important',
    },
}))
interface OperationFooterProps extends BoxProps {
    claimed: boolean
    isClaiming: boolean
    chainId: ChainId
    onClaim(): Promise<void>
}

export function OperationFooter({ claimed, chainId, isClaiming, onClaim, className, ...rest }: OperationFooterProps) {
    const { classes, cx } = useStyles()

    if (claimed) return null

    return (
        <Box {...rest} className={cx(classes.footer, className)}>
            <ChainBoundary
                expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                ActionButtonPromiseProps={{ variant: 'roundedDark' }}
                expectedChainId={chainId}>
                <WalletConnectedBoundary
                    expectedChainId={chainId}
                    startIcon={<Icons.Wallet size={18} />}
                    classes={{
                        connectWallet: classes.button,
                    }}
                    ActionButtonProps={{ variant: 'roundedDark' }}>
                    <ActionButton
                        variant="roundedDark"
                        loading={isClaiming}
                        disabled={isClaiming}
                        onClick={onClaim}
                        className={classes.button}
                        fullWidth>
                        {isClaiming ?
                            <Trans>Claiming...</Trans>
                        :   <Trans>Claim</Trans>}
                    </ActionButton>
                </WalletConnectedBoundary>
            </ChainBoundary>
        </Box>
    )
}
