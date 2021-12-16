import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { VaultListDialog } from './VaultListDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <VaultListDialog />
    },
}

export default sns
