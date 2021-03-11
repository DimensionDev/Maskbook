// Please make sure you have registered your plugin service (if it need one) at ./PluginService
import type { PluginConfig } from './types'

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { Flags } from '../utils/flags'
import { EthereumPluginDefine } from './Ethereum/define'
import { WalletPluginDefine } from './Wallet/define'
import { GitcoinPluginDefine } from './Gitcoin/define'
// import { RedPacketPluginDefine } from './RedPacket/define'
import { PollsPluginDefine } from './Polls/define'
// import { StorybookPluginDefine } from './Storybook/define'
// import { FileServicePluginDefine } from './FileService/UI-define'
// import { TraderPluginDefine } from './Trader/define'
// import { TransakPluginDefine } from './Transak/define'
// import { ITO_PluginDefine } from './ITO/define'
// import { NFTPluginsDefine } from './NFT/define'
// import { AirdropPluginDefine } from './Airdrop/define'
import { sideEffect } from '../utils/side-effects'

sideEffect.then(() => {
    plugins.add(EthereumPluginDefine)
    plugins.add(WalletPluginDefine)
    // plugins.add(RedPacketPluginDefine)
    // plugins.add(FileServicePluginDefine)
    // plugins.add(ITO_PluginDefine)
    // plugins.add(NFTPluginsDefine)
    if (Flags.gitcoin_enabled) plugins.add(GitcoinPluginDefine)
    if (Flags.poll_enabled) plugins.add(PollsPluginDefine)
    // if (Flags.trader_enabled) plugins.add(TraderPluginDefine)
    // if (Flags.transak_enabled) plugins.add(TransakPluginDefine)
    // if (Flags.airdrop_enabled) plugins.add(AirdropPluginDefine)
    // if (process.env.STORYBOOK) plugins.add(StorybookPluginDefine)
})
