import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal, context) {},
}

export default site
