import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { SwitchLogo } from './SwitchLogo.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    GlobalInjection() {
        return <SwitchLogo />
    },
}

export default sns
