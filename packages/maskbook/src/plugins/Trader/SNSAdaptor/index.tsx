import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { SettingsDialog } from './trader/SettingsDialog'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { TagInspector } from './trending/TagInspector'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchBoxComponent: SearchResultInspector,
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
                <SettingsDialog />
                <TraderDialog />
            </>
        )
    },
}

export default sns
