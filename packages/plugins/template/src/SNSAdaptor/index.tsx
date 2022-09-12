import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { setupContext } from './context.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {
        setupContext(context)
    },
}

export default sns
