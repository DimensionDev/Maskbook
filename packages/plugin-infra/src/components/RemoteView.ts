import React, { createElement, Fragment, useMemo } from 'react'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor'
import type { Plugin, PluginId } from '../types'

export interface WidgetProps<Name extends keyof Plugin.SNSAdaptor.WidgetRegistry> {
    name: Name
    pluginID?: PluginId
    fallback?: React.ReactElement | null
}

export const Widget: <Name extends keyof Plugin.SNSAdaptor.WidgetRegistry>(
    props: WidgetProps<Name> & (Plugin.SNSAdaptor.WidgetRegistry[Name] extends infer U extends object ? U : never),
) => React.ReactElement = (props) => {
    const { name, pluginID, fallback, ...rest } = props
    const plugins = useActivatedPluginsSNSAdaptor(false)
    const TargetView: any = useMemo(() => {
        if (pluginID) return plugins.find((x) => x.ID === pluginID)?.Widgets?.[name]
        return plugins.find((x) => x.Widgets && name in x.Widgets)?.Widgets![name].component
    }, [plugins])

    if (!TargetView) return fallback || createElement(Fragment, {})
    return createElement(TargetView, rest)
}
