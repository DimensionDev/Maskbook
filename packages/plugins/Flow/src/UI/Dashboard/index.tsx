import type { Plugin } from '@masknet/plugin-infra/src'
import { base } from '../../base'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

const sns: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    ProviderIconClickBait,
}

export default sns
