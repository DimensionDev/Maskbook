import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProviderIconClickBait,
}

export default sns
