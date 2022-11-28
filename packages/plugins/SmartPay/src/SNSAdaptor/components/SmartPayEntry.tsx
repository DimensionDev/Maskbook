import { CrossIsolationMessages, DashboardRoutes } from '@masknet/shared-base'
import { memo, useEffect, useCallback } from 'react'
import { ApplicationEntry, useSharedI18N } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PLUGIN_ID } from '../../constants.js'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'

import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginSmartPayMessages } from '../../message.js'
import { useQueryQualification } from '../../hooks/useQueryQualification.js'
export interface SmartPayEntryProps {
    disabled: boolean
    tooltipHint?: string
    onClick?: (walletConnectedCallback?: () => void) => void
    popperBoundary?: HTMLElement | null
}

export const SmartPayEntry = memo<SmartPayEntryProps>((props) => {
    const t = useSharedI18N()
    const [, queryQualification] = useQueryQualification()

    const { setDialog: setPersonaSelectPanelDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
    )

    const { setDialog: setCreatePersonaConfirmDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.openPageConfirm,
    )

    const { setDialog: setSmartPayDeployDialog } = useRemoteControlledDialog(
        PluginSmartPayMessages.smartPayDeployDialogEvent,
    )
    const { openDialog: openSmartPayDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    useEffect(() => {
        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, pluginID }) => {
            if (pluginID !== PLUGIN_ID) return
        })
    }, [])

    const handleClick = useCallback(async () => {
        const { hasPersona, eligibility } = (await queryQualification()) ?? {}

        if (!hasPersona) {
            setCreatePersonaConfirmDialog({
                open: true,
                target: 'dashboard',
                url: DashboardRoutes.Setup,
                text: t.create_persona_hint(),
                title: t.create_persona_title(),
                actionHint: t.create_persona_action(),
                position: 'center',
            })
            return
        } else if (!eligibility) {
            setPersonaSelectPanelDialog({
                open: true,
                enableVerify: true,
            })
            return
        }

        // setSmartPayDeployDialog({
        //     open: true,
        //     inWhiteList: true,
        // })
        openSmartPayDialog()
    }, [])

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
