// Plugin defined in new infra is registered in
// packages/maskbook/src/plugin-infra/register.ts
// Please make sure you have registered your plugin service (if it need one) at ./PluginService
import type { PluginConfig } from './types'

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { Flags } from '../utils/flags'
import { sideEffect } from '../utils/side-effects'
import { DHedgePluginDefine } from './dHEDGE/define'
import { PoolTogetherPluginDefine } from './PoolTogether/define'

sideEffect.then(() => {
    if (Flags.dhedge_enabled) plugins.add(DHedgePluginDefine)
    if (Flags.pooltogether_enabled) plugins.add(PoolTogetherPluginDefine)
})
