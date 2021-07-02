import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { BuyTokenDialog } from './BuyTokenDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <BuyTokenDialog />
    },
}

export default sns
