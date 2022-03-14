import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { CheckSecurityDialog } from './CheckSecurityDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <CheckSecurityDialog />
    },
}

export default sns
