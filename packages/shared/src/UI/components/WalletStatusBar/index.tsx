import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { Box, Button, CircularProgress } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import { WalletMessages } from '@masknet/plugin-wallet'
import type { BindingProof } from '@masknet/shared-base'
import classNames from 'classnames'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMenuBar } from './WalletMenuBar'

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
    onChange?: (address: string) => void
}

export function WalletStatusBar(props: WalletStatusBarProps) {
    const t = useSharedI18N()
    const { iconSize = 30, badgeSize = 12, actionProps, className, onChange } = props
    const classes = useStylesExtends(useStyles(), props)

    const { setDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const connectWalletDialog = () => openSelectProviderDialog({ open: true, pluginID: NetworkPluginID.PLUGIN_EVM })

    return (
        <Box className={classNames(classes.root, className)}>
            <Box sx={{ flex: 1 }}>
                <WalletMenuBar
                    openPopupsWindow={actionProps?.openPopupsWindow}
                    iconSize={iconSize}
                    badgeSize={badgeSize}
                    onChange={(address: string) => onChange?.(address)}
                    wallets={actionProps?.wallets ?? []}
                />
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
                {!actionProps ? (
                    <Button variant="contained" className={classes.button} fullWidth onClick={connectWalletDialog}>
                        Change
                    </Button>
                ) : (
                    <Button
                        sx={{
                            backgroundColor:
                                actionProps.color === 'warning' ? '#FF3545' : MaskColorVar.buttonPluginBackground,
                            color: actionProps.color === 'warning' ? '#ffffff' : MaskColorVar.twitterButtonText,
                            '&:hover': {
                                backgroundColor:
                                    actionProps.color === 'warning' ? '#FF3545' : MaskColorVar.buttonPluginBackground,
                            },
                        }}
                        startIcon={actionProps.startIcon}
                        endIcon={actionProps.endIcon}
                        variant="contained"
                        className={classes.button}
                        fullWidth
                        disabled={actionProps.loading || actionProps.disabled}
                        onClick={actionProps.action ?? connectWalletDialog}>
                        {actionProps.loading ? <CircularProgress size={24} className={classes.progress} /> : null}
                        {actionProps.title ?? t.change()}
                    </Button>
                )}
            </Box>
        </Box>
    )
}
