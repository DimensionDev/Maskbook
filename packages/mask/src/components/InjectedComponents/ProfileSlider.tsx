import { createInjectHooksRenderer, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'

const PluginRenderer = createInjectHooksRenderer(useActivatedPluginsSNSAdaptor.visibility.useAnyMode, (x) => {
    return () => {
        return <div>Profile Slider</div>
    }
})

export interface ProfileSliderProps {}

export function ProfileSlider(props: ProfileSliderProps) {
    return <PluginRenderer />
}
