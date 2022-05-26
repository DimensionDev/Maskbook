import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { Box, Button } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import { WalletMessages } from '@masknet/plugin-wallet'
import type { BindingProof } from '@masknet/shared-base'
import classNames from 'classnames'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMenuBar } from './WalletMenuBar'
import { WalletButton } from './WalletBarButton'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
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
}))

export interface WalletStatusBarProps extends withClasses<'button'> {
    iconSize?: number
    badgeSize?: number
    className?: string
    actionProps?: {
        title?: string | React.ReactElement | React.ReactNode
        action?: () => Promise<void>
        disabled?: boolean
        startIcon?: React.ReactNode
        endIcon?: React.ReactNode
        loading?: boolean
        color?: 'warning'
        openPopupsWindow?: () => void
        wallets?: BindingProof[]
    }
    onChange?: (address: string) => void
    pending?: string | React.ReactElement | React.ReactNode
}

export function WalletStatusBar(props: WalletStatusBarProps) {
    const t = useSharedI18N()
    const { iconSize = 30, badgeSize = 12, actionProps, className, onChange, pending } = props
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
                    pending={pending}
                />
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
                {!actionProps ? (
                    <Button variant="contained" className={classes.button} fullWidth onClick={connectWalletDialog}>
                        Change
                    </Button>
                ) : (
                    <WalletButton
                        startIcon={actionProps.startIcon}
                        endIcon={actionProps.endIcon}
                        classes={{ root: classes.button }}
                        title={actionProps.title}
                        disabled={actionProps.loading || actionProps.disabled}
                        loading={actionProps.loading}
                        action={actionProps.action}
                        color={actionProps.color}
                    />
                )}
            </Box>
        </Box>
    )
}
