import { memo, useCallback, useEffect } from 'react'
import { Trans } from 'react-i18next'
import { ApplicationEntry, LeavePageConfirmModal, PersonaSelectPanelModal, useSharedI18N } from '@masknet/shared'
import { CrossIsolationMessages, DashboardRoutes, PluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Icons } from '@masknet/icons'
import { useWallets } from '@masknet/web3-hooks-base'
import { useAllPersonas, useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'
import { PluginSmartPayMessages } from '../../message.js'
import { useQueryQualifications } from '../../hooks/useQueryQualifications.js'

export interface SmartPayEntryProps {
    disabled: boolean
    tooltipHint?: string
    onClick?: (walletConnectedCallback?: () => void) => void
}

export const SmartPayEntry = memo<SmartPayEntryProps>((props) => {
    const t = useSharedI18N()

    const wallets = useWallets()
    const personas = useAllPersonas()
    const { openDashboard } = useSiteAdaptorContext()

    const { setDialog: setSmartPayDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    const { value, loading } = useQueryQualifications()

    const handleClick = useCallback(async () => {
        if (loading || !value) return

        // Contract account already exists
        if (wallets.filter((x) => x.owner).length) {
            setSmartPayDialog({
                open: true,
                hasAccounts: true,
                signWallet: value.signWallet,
                signPersona: value.signPersona,
            })
            return
        }
        // If there is no persona and no signer
        if (!personas.length && !value.signPersona && !value.signWallet) {
            LeavePageConfirmModal.open({
                info: {
                    target: 'dashboard',
                    url: DashboardRoutes.SignUpPersona,
                    text: t.create_persona_hint(),
                    title: t.create_persona_title(),
                    actionHint: t.create_persona_action(),
                    position: 'center',
                },
                openDashboard,
            })
            return
        }

        // if there is verified persona but current persona isn't verified
        if ((value.hasVerifiedPersona || personas.length) && !value.signPersona && !value.signWallet) {
            return PersonaSelectPanelModal.open({
                enableVerify: true,
                target: PluginID.SmartPay,
            })
        }
        return setSmartPayDialog({
            open: true,
            signWallet: value.signWallet,
            signPersona: value.signPersona,
        })
    }, [loading, wallets, value, personas])

    useEffect(() => {
        return CrossIsolationMessages.events.applicationDialogEvent.on(({ selectedPersona, pluginID, open }) => {
            if (pluginID !== PluginID.SmartPay) return
            setSmartPayDialog({
                open,
                signPersona: selectedPersona,
            })
        })
    }, [])

    return (
        <ApplicationEntry
            {...props}
            icon={<Icons.SmartPay size={36} />}
            title={<Trans ns={PluginID.SmartPay} i18nKey="__plugin_name" />}
            onClick={() => (props.onClick ? props.onClick() : handleClick())}
        />
    )
})
