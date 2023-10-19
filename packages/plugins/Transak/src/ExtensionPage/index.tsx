import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { BuyTokenGlobalInjection } from '../SiteAdaptor/BuyTokenGlobalInjection.js'

const extensionPage: Plugin.ExtensionPage.Definition = {
    ...base,
    GlobalInjection: BuyTokenGlobalInjection,
}

export default extensionPage
