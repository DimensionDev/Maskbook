import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

const PluginRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor, (x) => {
    return () => {
        return <div>Profile Tab</div>
    }
})

export interface ProfileTabProps {}

export function ProfileTab(props: ProfileTabProps) {
    return <PluginRenderer />
}
