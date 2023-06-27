import { Modals } from '@masknet/shared'
import { base } from '@masknet/plugin-wallet'
import type { Plugin } from '@masknet/plugin-infra'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <Modals />
    },
}

export default sns
