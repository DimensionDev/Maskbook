import { ActionButton } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginGoPlusSecurityMessages } from '../messages.js'
import { useGoPlusLabsI18N } from '../locales/index.js'

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

    const t = useGoPlusLabsI18N()

    const { setDialog: setRiskWarningDialog } = useRemoteControlledDialog(
        PluginGoPlusSecurityMessages.tokenRiskWarningDialogEvent,
        ({ swap }) => {
            if (swap) onSwap()
        },
    )

    if (showTokenSecurity)
        return (
            <ActionButton
                color="error"
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
                {t.confirm_swap_risk()}
            </ActionButton>
        )

    return <>{children}</>
}
