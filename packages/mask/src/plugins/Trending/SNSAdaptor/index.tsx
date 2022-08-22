import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { TagInspector } from './trending/TagInspector'
import { enhanceTag } from './cashTag'
import { setupStorage, storageDefaultValue } from '../storage'
import type { ChainId } from '@masknet/web3-shared-evm'

const sns: Plugin.SNSAdaptor.Definition<
    ChainId,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown
> = {
    ...base,
    init(signal, context) {
        setupStorage(context.createKVStorage('persistent', storageDefaultValue))
    },
    SearchResultBox: SearchResultInspector,
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
            </>
        )
    },
    enhanceTag,
}

export default sns
