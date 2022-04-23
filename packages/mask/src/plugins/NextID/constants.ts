import { PluginId } from '@masknet/plugin-infra'
import type { LiveSelector } from '@dimensiondev/holoflows-kit'
import { searchAllProfileTabSelector } from '../../social-network-adaptor/twitter.com/utils/selector'

export const PLUGIN_ID = PluginId.NextID
export const PLUGIN_DESCRIPTION = 'Next ID'
export const PLUGIN_NAME = 'NextID'

export const TAB_SELECTOR: { [key: string]: LiveSelector<HTMLElement, true> } = {
    twitter: searchAllProfileTabSelector(),
}
