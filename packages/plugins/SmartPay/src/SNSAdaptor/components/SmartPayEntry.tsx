import { CrossIsolationMessages } from '@masknet/shared-base'
import { memo, useEffect } from 'react'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { PLUGIN_ID } from '../../constants.js'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { noop } from 'lodash-unified'

export interface SmartPayEntryProps {
    disabled: boolean
    tooltipHint?: string
    onClick?: (walletConnectedCallback?: () => void) => void
    popperBoundary?: HTMLElement | null
}

export const SmartPayEntry = memo<SmartPayEntryProps>((props) => {
    useEffect(() => {
        return CrossIsolationMessages.events.applicationDialogEvent.on(({ open, pluginID }) => {
            if (pluginID !== PLUGIN_ID) return
        })
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
            onClick={() => (props.onClick ? props.onClick() : noop)}
        />
    )
})
