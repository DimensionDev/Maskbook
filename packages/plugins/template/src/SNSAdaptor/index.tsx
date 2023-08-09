import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'

const sns: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
}

export default sns
