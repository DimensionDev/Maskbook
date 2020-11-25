// Please make sure you have registered your plugin service (if it need one) at ./PluginService
import type { PluginConfig } from './types'
import { insertI18NBundle } from '../utils/i18n-next'
const plugins = new Set<PluginConfig>()
plugins.add = (value) => {
    if (value.i18n) {
        const f = insertI18NBundle.bind(null, value.identifier)
        Promise.resolve(value.i18n(f)).then(f).catch(console.error)
    }
    return Set.prototype.add.call(plugins, value)
}
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { WalletPluginDefine } from './Wallet/define'
import { GitcoinPluginDefine } from './Gitcoin/define'
import { RedPacketPluginDefine } from './RedPacket/define'
import { PollsPluginDefine } from './Polls/define'
import { StorybookPluginDefine } from './Storybook/define'
import { FileServicePluginDefine } from './FileService/define'
import { TraderPluginDefine } from './Trader/define'
import { Election2020PluginDefine } from './Election2020/define'
import { Flags } from '../utils/flags'
import { TransakPluginDefine } from './Transak/define'

plugins.add(WalletPluginDefine)
plugins.add(GitcoinPluginDefine)
plugins.add(RedPacketPluginDefine)
plugins.add(FileServicePluginDefine)
if (Flags.poll_enabled) plugins.add(PollsPluginDefine)
if (Flags.trader_enabled) plugins.add(TraderPluginDefine)
if (Flags.transak_enabled) plugins.add(TransakPluginDefine)
if (Flags.election2020_enabled) plugins.add(Election2020PluginDefine)
if (process.env.STORYBOOK) plugins.add(StorybookPluginDefine)
