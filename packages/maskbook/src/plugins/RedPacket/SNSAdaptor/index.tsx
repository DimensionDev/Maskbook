import type { Plugin } from '@dimensiondev/mask-plugin-infra'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
}

export default sns
