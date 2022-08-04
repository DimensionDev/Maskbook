import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { PluginGoPlusSecurityMessages } from '@masknet/plugin-go-plus-security'
import { useI18N } from '../../utils'
import type { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    button: {
        backgroundColor: theme.palette.maskColor.danger,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.danger,
        },
    },
}))

interface Token {
    contract: string
    name: string
    chainId: ChainId
}

export interface TokenSecurityBoundaryProps {
    children?: React.ReactNode
    showTokenSecurity?: boolean
    tokenInfo: Token
    onSwap: () => void
    disabled: boolean
}

export function TokenSecurityBoundary(props: TokenSecurityBoundaryProps) {
    const { children = null, showTokenSecurity = false, tokenInfo, onSwap, disabled = true } = props

    const { t } = useI18N()
    const { classes } = useStyles()

    const { setDialog: setRiskWarningDialog } = useRemoteControlledDialog(
        PluginGoPlusSecurityMessages.tokenRiskWarningDialogEvent,
        ({ swap }) => {
            if (swap) onSwap()
        },
    )

    if (showTokenSecurity)
        return (
            <ActionButton
                className={classes.button}
                fullWidth
                variant="contained"
                disabled={disabled}
                onClick={() => {
                    setRiskWarningDialog({
                        open: true,
                        token: tokenInfo,
                        swap: false,
                    })
                }}>
                {t('confirm_swap_risk')}
            </ActionButton>
        )

    return <>{children}</>
}
