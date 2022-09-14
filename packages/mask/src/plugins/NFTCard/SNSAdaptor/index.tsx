import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { NFTCardDialog } from './NFTCardDialog.js'

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
