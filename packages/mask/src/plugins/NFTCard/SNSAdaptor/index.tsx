import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { NFTCardDialog } from './NFTCardDialog'
const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <NFTCardDialog />
            </>
        )
    },
}

export default sns
