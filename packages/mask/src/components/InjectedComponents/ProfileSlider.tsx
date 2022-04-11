import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

const PluginRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => () => (
    <div>Profile Slider</div>
))

export interface ProfileSliderProps {}

export function ProfileSlider(props: ProfileSliderProps) {
    return <PluginRenderer />
}
