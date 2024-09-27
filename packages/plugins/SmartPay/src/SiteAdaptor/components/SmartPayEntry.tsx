import { memo, useCallback, useEffect, type ReactNode } from 'react'
import { ApplicationEntry, LeavePageConfirmModal, PersonaSelectPanelModal, useSharedTrans } from '@masknet/shared'
import { CrossIsolationMessages, DashboardRoutes, PluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { Icons } from '@masknet/icons'
import { useWallets } from '@masknet/web3-hooks-base'
import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { PluginSmartPayMessages } from '../../message.js'
import { useQueryQualifications } from '../../hooks/useQueryQualifications.js'
import { openDashboard } from '@masknet/plugin-infra/dom/context'
import { Trans } from '@lingui/macro'

interface SmartPayEntryProps {
    disabled: boolean
    tooltipHint?: ReactNode
    onClick?: (walletConnectedCallback?: () => void) => void
}

export const SmartPayEntry = memo<SmartPayEntryProps>((props) => {
    const t = useSharedTrans()

    const wallets = useWallets()
    const personas = useAllPersonas()

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
                finishTarget: PluginID.SmartPay,
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
            title={<Trans>Smart Pay</Trans>}
            onClick={() => (props.onClick ? props.onClick() : handleClick())}
        />
    )
})
