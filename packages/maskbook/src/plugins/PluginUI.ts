// Plugin defined in new infra is registered in
// packages/maskbook/src/plugin-infra/register.ts
// Please make sure you have registered your plugin service (if it need one) at ./PluginService
import type { PluginConfig } from './types'

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { Flags } from '../utils/flags'
import { PollsPluginDefine } from './Polls/define'
import { StorybookPluginDefine } from './Storybook/define'
import { FileServicePluginDefine } from './FileService/UI-define'
import { TraderPluginDefine } from './Trader/define'
import { ITO_PluginDefine } from './ITO/define'
import { sideEffect } from '../utils/side-effects'
import { VCentPluginDefine } from './VCent/define'
import { DHedgePluginDefine } from './dHEDGE/define'

sideEffect.then(() => {
    plugins.add(FileServicePluginDefine)
    if (Flags.ito_enabled) plugins.add(ITO_PluginDefine)
    if (Flags.vcent_enabled) plugins.add(VCentPluginDefine)
    if (Flags.poll_enabled) plugins.add(PollsPluginDefine)
    if (Flags.trader_enabled) plugins.add(TraderPluginDefine)
    if (Flags.dhedge_enabled) plugins.add(DHedgePluginDefine)
    if (process.env.STORYBOOK) plugins.add(StorybookPluginDefine)
})
