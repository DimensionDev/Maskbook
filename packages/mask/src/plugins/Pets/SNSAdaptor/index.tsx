import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import AnimatePic from './animate'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return <AnimatePic />
    },
}

export default sns
