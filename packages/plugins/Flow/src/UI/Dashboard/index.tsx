import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { Web3UI } from '../Web3UI'
import { createWeb3State } from '../../state'
import { SharedContextSettings, Web3StateSettings } from '../../settings'

const sns: Plugin.Dashboard.Definition = {
    ...base,
    init(signal, context) {
        SharedContextSettings.value = context
        Web3StateSettings.value = createWeb3State(context)

        // @ts-ignore
        sns.Web3State = Web3StateSettings.value
    },
    Web3UI,
}

export default sns
