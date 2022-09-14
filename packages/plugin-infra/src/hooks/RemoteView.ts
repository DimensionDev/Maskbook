import React, { createElement, Fragment, useMemo } from 'react'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor'
import type { Plugin, PluginId } from '../types'

export interface RemoteViewProps<Name extends keyof Plugin.SNSAdaptor.ContributedViewRegistry> {
    name: Name
    pluginID?: PluginId
    fallback?: React.ReactElement | null
}
export const RemoteView: <Name extends keyof Plugin.SNSAdaptor.ContributedViewRegistry>(
    props: RemoteViewProps<Name> &
        (Plugin.SNSAdaptor.ContributedViewRegistry[Name] extends infer U extends object ? U : never),
) => React.ReactElement = (props) => {
    const { name, pluginID, fallback, ...rest } = props
    const plugins = useActivatedPluginsSNSAdaptor(false)
    const TargetView: any = useMemo(() => {
        if (pluginID) return plugins.find((x) => x.ID === pluginID)?.ContributedView?.[name]
        return plugins.find((x) => x.ContributedView && name in x.ContributedView)?.ContributedView![name].component
    }, [plugins])

    if (!TargetView) return fallback || createElement(Fragment, {})
    return createElement(TargetView, rest)
}
