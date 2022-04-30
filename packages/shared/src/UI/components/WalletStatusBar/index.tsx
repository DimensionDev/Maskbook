import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { useAccount, useChainIdValid, useWallet } from '@masknet/web3-shared-evm'
import { Box, Button, CircularProgress } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import { WalletUI } from './WalletUI'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    button: {
        borderRadius: 8,
        position: 'relative',
        textAlign: 'center',
        margin: 0,
    },

    progress: {
        color: MaskColorVar.twitterButtonText,
        position: 'absolute',
        top: theme.spacing(1),
        left: `calc(50%-${theme.spacing(1)})`,
    },
}))
interface WalletStatusBarProps extends withClasses<'button'> {
    iconSize?: number
    badgeSize?: number
    actionProps?: {
        title?: string | React.ReactElement | React.ReactNode
        action?: () => void
        disabled?: boolean
        startIcon?: React.ReactNode
        endIcon?: React.ReactNode
        loading?: boolean
        color?: 'warning'
    }
}

export function WalletStatusBar(props: WalletStatusBarProps) {
    const t = useSharedI18N()
    const { iconSize = 24, badgeSize = 10, actionProps } = props
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const selectedWallet = useWallet()
    const chainIdValid = useChainIdValid()

    const isWalletValid = Boolean(!!account || selectedWallet || chainIdValid)
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const { openDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )

    return (
        <Box className={classes.root}>
            {!isWalletValid ? (
                <Button variant="contained" className={classes.button} fullWidth onClick={setConnectWalletDialog}>
                    Connect Wallet
                </Button>
            ) : (
                <>
                    <Box sx={{ flex: 1 }}>
                        <WalletUI iconSize={iconSize} badgeSize={badgeSize} onClick={openSelectProviderDialog} />
                    </Box>

                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        {!actionProps ? (
                            <Button
                                variant="contained"
                                className={classes.button}
                                fullWidth
                                onClick={openSelectProviderDialog}>
                                Change
                            </Button>
                        ) : (
                            <Button
                                sx={{
                                    backgroundColor: actionProps.color === 'warning' ? '#FF3545' : '#07101B',
                                    color: actionProps.color === 'warning' ? '#ffffff' : MaskColorVar.twitterButtonText,
                                    '&:hover': {
                                        backgroundColor: actionProps.color === 'warning' ? '#FF3545' : '#07101B',
                                    },
                                }}
                                startIcon={actionProps.startIcon}
                                endIcon={actionProps.endIcon}
                                variant="contained"
                                className={classes.button}
                                fullWidth
                                disabled={actionProps.loading || actionProps.disabled}
                                onClick={actionProps.action}>
                                {actionProps.loading ? (
                                    <CircularProgress size={24} className={classes.progress} />
                                ) : null}
                                {actionProps.title}
                            </Button>
                        )}
                    </Box>
                </>
            )}
        </Box>
    )
}
