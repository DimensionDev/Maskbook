import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../components/Web3UI'
import { GlobalInjection } from '../components/GlobalInjection'
import { setupSharedContext } from '../../settings'
import { setupWeb3State } from '../../state'

const sns: Plugin.Dashboard.Definition = {
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
