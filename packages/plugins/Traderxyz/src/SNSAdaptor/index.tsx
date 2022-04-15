import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { setupContext } from './context'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
}

export default sns
