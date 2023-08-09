import type React from 'react'
import { createElement, Fragment, useMemo } from 'react'
import type { PluginID } from '@masknet/shared-base'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor.js'
import type { Plugin } from '../types.js'

export interface WidgetProps<Name extends keyof Plugin.SiteAdaptor.WidgetRegistry> {
    name: Name
    pluginID?: PluginID
    fallback?: React.ReactNode | null
}

export function Widget<Name extends keyof Plugin.SiteAdaptor.WidgetRegistry>(
    props: WidgetProps<Name> & (Plugin.SiteAdaptor.WidgetRegistry[Name] extends infer U extends object ? U : never),
) {
    const { name, pluginID, fallback, ...rest } = props
    const plugins = useActivatedPluginsSNSAdaptor(false)
    const WidgetComponent: any = useMemo(() => {
        if (pluginID) return plugins.find((x) => x.ID === pluginID)?.Widgets?.find((y) => y.name === name)?.UI?.Widget
        return null
    }, [plugins])

    if (!WidgetComponent) return createElement(Fragment, { children: fallback })
    return createElement(WidgetComponent, rest)
}
