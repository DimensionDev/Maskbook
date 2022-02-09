import type { Plugin } from '@masknet/plugin-infra'
import { EvmContextProvider } from '../../EVM/contexts'
import { base } from '../base'
import { TraderDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { TagInspector } from './trending/TagInspector'
import { enhanceTag } from './cashTag'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchResultBox() {
        return (
            <EvmContextProvider>
                <SearchResultInspector />
            </EvmContextProvider>
        )
    },
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
                <TraderDialog />
            </>
        )
    },
    enhanceTag,
}

export default sns
