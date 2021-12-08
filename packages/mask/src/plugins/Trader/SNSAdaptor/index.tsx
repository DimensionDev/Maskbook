import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { baseDeferred } from '../base-deferred'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { TagInspector } from './trending/TagInspector'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    ...baseDeferred,
    init(signal) {},
    SearchResultBox: SearchResultInspector,
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
                <TraderDialog />
            </>
        )
    },
}

export default sns
