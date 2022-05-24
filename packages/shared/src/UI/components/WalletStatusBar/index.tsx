import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { useAccount, useChainIdValid, useWallet } from '@masknet/web3-shared-evm'
import { Box, Button, CircularProgress } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletMenuBar } from './WalletMenuBar'
import type { BindingProof } from '@masknet/shared-base'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                : '0px 0px 20px rgba(0, 0, 0, 0.05)',
        padding: theme.spacing(2),
        borderRadius: theme.spacing(0, 0, 1.5, 1.5),
    },
    button: {
        borderRadius: 8,
        position: 'relative',
        textAlign: 'center',
        margin: 0,
        backgroundColor: MaskColorVar.buttonPluginBackground,
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
    className?: string
    actionProps?: {
        title?: string | React.ReactElement | React.ReactNode
        action?: () => void
        disabled?: boolean
        startIcon?: React.ReactNode
        endIcon?: React.ReactNode
        loading?: boolean
        color?: 'warning'
        openPopupsWindow: () => void
        wallets: BindingProof[]
    }
}

export function WalletStatusBar(props: WalletStatusBarProps) {
    const t = useSharedI18N()
    const { iconSize = 30, badgeSize = 12, actionProps, className } = props
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
        <Box className={classNames(classes.root, className)}>
            {!isWalletValid ? (
                <Button variant="contained" className={classes.button} fullWidth onClick={setConnectWalletDialog}>
                    Connect Wallet
                </Button>
            ) : (
                <>
                    <Box sx={{ flex: 1 }}>
                        <WalletMenuBar
                            openPopupsWindow={actionProps?.openPopupsWindow}
                            iconSize={iconSize}
                            badgeSize={badgeSize}
                            onChange={openSelectProviderDialog}
                            wallets={actionProps?.wallets ?? []}
                        />
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
                                    backgroundColor:
                                        actionProps.color === 'warning'
                                            ? '#FF3545'
                                            : MaskColorVar.buttonPluginBackground,
                                    color: actionProps.color === 'warning' ? '#ffffff' : MaskColorVar.twitterButtonText,
                                    '&:hover': {
                                        backgroundColor:
                                            actionProps.color === 'warning'
                                                ? '#FF3545'
                                                : MaskColorVar.buttonPluginBackground,
                                    },
                                }}
                                startIcon={actionProps.startIcon}
                                endIcon={actionProps.endIcon}
                                variant="contained"
                                className={classes.button}
                                fullWidth
                                disabled={actionProps.loading || actionProps.disabled}
                                onClick={actionProps.action ?? openSelectProviderDialog}>
                                {actionProps.loading ? (
                                    <CircularProgress size={24} className={classes.progress} />
                                ) : null}
                                {actionProps.title ?? t.change()}
                            </Button>
                        )}
                    </Box>
                </>
            )}
        </Box>
    )
}
