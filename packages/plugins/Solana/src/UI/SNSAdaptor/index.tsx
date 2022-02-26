import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { setupWeb3State } from '../../state'
import { setupSharedContext } from '../../context'
import { Web3UI } from '../Web3UI'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        setupSharedContext(context)

        // @ts-ignore
        sns.Web3State = await setupWeb3State(context)

        // await connectWallet(true)
        // await watchAccount()
    },
    Web3UI,
}

export default sns
