import React, { createElement, Fragment, useMemo } from 'react'
import type { PluginID } from '@masknet/shared-base'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor.js'
import type { Plugin } from '../types.js'

export interface WidgetProps<Name extends keyof Plugin.SNSAdaptor.WidgetRegistry> {
    name: Name
    pluginID?: PluginID
    fallback?: React.ReactElement | null
}

export function Widget<Name extends keyof Plugin.SNSAdaptor.WidgetRegistry>(
    props: WidgetProps<Name> & (Plugin.SNSAdaptor.WidgetRegistry[Name] extends infer U extends object ? U : never),
) {
    const { name, pluginID, fallback, ...rest } = props
    const plugins = useActivatedPluginsSNSAdaptor(false)
    const WidgetComponent: any = useMemo(() => {
        if (pluginID) return plugins.find((x) => x.ID === pluginID)?.Widgets?.find((y) => y.name === name)?.UI?.Widget
        return null
    }, [plugins])

    if (!WidgetComponent) return fallback || createElement(Fragment, {})
    return createElement(WidgetComponent, rest)
}
