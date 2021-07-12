// Plugin defined in new infra is registered in
// packages/maskbook/src/plugin-infra/register.ts
// Please make sure you have registered your plugin service (if it need one) at ./PluginService
import type { PluginConfig } from './types'

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { sideEffect } from '../utils/side-effects'

sideEffect.then(() => {})
