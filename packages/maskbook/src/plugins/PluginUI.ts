// Please make sure you have registered your plugin service (if it need one) at ./PluginService
import type { PluginConfig } from './types'

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { Flags } from '../utils/flags'
import { EthereumPluginDefine } from './Ethereum/define'
import { WalletPluginDefine } from './Wallet/define'
import { GitcoinPluginDefine } from './Gitcoin/define'
import { RedPacketPluginDefine } from './RedPacket/define'
import { PollsPluginDefine } from './Polls/define'
import { StorybookPluginDefine } from './Storybook/define'
import { FileServicePluginDefine } from './FileService/define'
import { TraderPluginDefine } from './Trader/define'
import { Election2020PluginDefine } from './Election2020/define'
import { TransakPluginDefine } from './Transak/define'
import { COTM_PluginDefine } from './COTM/define'

plugins.add(EthereumPluginDefine)
plugins.add(WalletPluginDefine)
plugins.add(RedPacketPluginDefine)
plugins.add(FileServicePluginDefine)
if (Flags.gitcoin_enabled) plugins.add(GitcoinPluginDefine)
if (Flags.poll_enabled) plugins.add(PollsPluginDefine)
if (Flags.trader_enabled) plugins.add(TraderPluginDefine)
if (Flags.transak_enabled) plugins.add(TransakPluginDefine)
if (Flags.election2020_enabled) plugins.add(Election2020PluginDefine)
if (Flags.COTM_enabled) plugins.add(COTM_PluginDefine)
if (process.env.STORYBOOK) plugins.add(StorybookPluginDefine)
