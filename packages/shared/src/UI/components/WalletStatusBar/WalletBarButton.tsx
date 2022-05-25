import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import type { ERC20TokenDetailed, EthereumTokenType } from '@masknet/web3-shared-evm'
import { Button, CircularProgress } from '@mui/material'
import { useSharedI18N } from '../../../locales'

export type ERC20Bounday = {
    amount: string
    spender: string
    token: ERC20TokenDetailed
    type: EthereumTokenType
}
export type ERC721Bounday = {}

interface WalletButtonProps extends withClasses<'root'> {
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
    color?: 'warning'
    loading?: boolean
    disabled?: boolean
    action?: () => void
    title?: string | React.ReactElement | React.ReactNode
    boundary?: ERC20Bounday | ERC721Bounday
}

const useStyles = makeStyles()((theme) => ({
    progress: {
        color: MaskColorVar.twitterButtonText,
        position: 'absolute',
        top: theme.spacing(1),
        left: `calc(50%-${theme.spacing(1)})`,
    },
}))

export function WalletButton(props: WalletButtonProps) {
    const { color, startIcon, endIcon, loading = false, disabled = false, action, title } = props
    const classes = useStylesExtends(useStyles(), props)
    const t = useSharedI18N()
    const { setDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const connectWalletDialog = () => openSelectProviderDialog({ open: true, pluginID: NetworkPluginID.PLUGIN_EVM })

    return (
        <Button
            sx={{
                backgroundColor: color === 'warning' ? '#FF3545' : MaskColorVar.buttonPluginBackground,
                color: color === 'warning' ? '#ffffff' : MaskColorVar.twitterButtonText,
                '&:hover': {
                    backgroundColor: color === 'warning' ? '#FF3545' : MaskColorVar.buttonPluginBackground,
                },
            }}
            startIcon={startIcon}
            endIcon={endIcon}
            variant="contained"
            className={classes.root}
            fullWidth
            disabled={loading || disabled}
            onClick={action ?? connectWalletDialog}>
            {loading ? <CircularProgress size={24} className={classes.progress} /> : null}
            {title ?? t.change()}
        </Button>
    )
}
