import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../components/Web3UI'
import { setupWeb3State } from '../../state'
import { GlobalInjection } from '../components/GlobalInjection'
import { setupSharedContext } from '../../context'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        setupSharedContext(context)

        // @ts-ignore
        sns.Web3State = await setupWeb3State(context)
    },
    Web3UI,
    GlobalInjection,
}

export default sns
