import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { baseDeferred } from '../base-deferred'
import { SettingsDialog } from './trader/SettingsDialog'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { TagInspector } from './trending/TagInspector'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    ...baseDeferred,
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
