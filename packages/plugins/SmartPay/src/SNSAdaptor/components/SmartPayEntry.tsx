import { CrossIsolationMessages, DashboardRoutes } from '@masknet/shared-base'
import { memo, useCallback } from 'react'
import { ApplicationEntry, useSharedI18N } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PLUGIN_ID } from '../../constants.js'
import { PluginI18NFieldRender, useAllPersonas } from '@masknet/plugin-infra/content-script'

import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginSmartPayMessages } from '../../message.js'
import { useWallets } from '@masknet/web3-hooks-base'
import { useQueryQualifications } from '../../hooks/useQueryQualifications.js'
export interface SmartPayEntryProps {
    disabled: boolean
    tooltipHint?: string
    onClick?: (walletConnectedCallback?: () => void) => void
    popperBoundary?: HTMLElement | null
}

export const SmartPayEntry = memo<SmartPayEntryProps>((props) => {
    const t = useSharedI18N()

    const wallets = useWallets()
    const personas = useAllPersonas()

    const { setDialog: setPersonaSelectPanelDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
    )

    const { setDialog: setCreatePersonaConfirmDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.openPageConfirm,
    )

    const { setDialog: setSmartPayDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    const { value, loading } = useQueryQualifications()

    const handleClick = useCallback(async () => {
        if (loading || !value) return

        // Contract account already exists
        if (wallets.filter((x) => x.owner).length)
            return setSmartPayDialog({
                open: true,
                hasAccounts: true,
                signWallet: value.signWallet,
                signPersona: value.signPersona,
            })

        // If there is no persona and no signer
        if (!personas.length && !value.signPersona && !value.signWallet) {
            return setCreatePersonaConfirmDialog({
                open: true,
                target: 'dashboard',
                url: DashboardRoutes.Setup,
                text: t.create_persona_hint(),
                title: t.create_persona_title(),
                actionHint: t.create_persona_action(),
                position: 'center',
            })
        }

        // if there is verified persona but current persona isn't verified
        if ((value.hasVerifiedPersona || personas.length) && !value.signPersona && !value.signWallet) {
            return setPersonaSelectPanelDialog({
                open: true,
                enableVerify: true,
            })
        }

        return setSmartPayDialog({
            open: true,
            signWallet: value.signWallet,
            signPersona: value.signPersona,
        })
    }, [loading, wallets, value, personas])

    return (
        <ApplicationEntry
            {...props}
            icon={<Icons.SmartPay size={36} />}
            title={
                <PluginI18NFieldRender
                    field={{ i18nKey: '__plugin_name', fallback: 'Smart Pay' }}
                    pluginID={PLUGIN_ID}
                />
            }
            onClick={() => (props.onClick ? props.onClick() : handleClick())}
        />
    )
})
