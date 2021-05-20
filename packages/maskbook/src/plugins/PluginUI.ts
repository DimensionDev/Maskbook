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
import { FileServicePluginDefine } from './FileService/UI-define'
import { TraderPluginDefine } from './Trader/define'
import { TransakPluginDefine } from './Transak/define'
import { ITO_PluginDefine } from './ITO/define'
// import { NFTPluginsDefine } from './NFT/define'
import { AirdropPluginDefine } from './Airdrop/define'
import { CollectiblesPluginDefine } from './Collectible/define'
import { sideEffect } from '../utils/side-effects'
import { VCentPluginDefine } from './VCent/define'
import { SnapShotPluginDefine } from './Snapshot/define'
import { DHedgePluginDefine } from './dHEDGE/define'

sideEffect.then(() => {
    plugins.add(EthereumPluginDefine)
    plugins.add(WalletPluginDefine)
    plugins.add(RedPacketPluginDefine)
    plugins.add(FileServicePluginDefine)
    // plugins.add(NFT_PluginsDefine)
    if (Flags.ito_enabled) plugins.add(ITO_PluginDefine)
    if (Flags.vcent_enabled) plugins.add(VCentPluginDefine)
    if (Flags.gitcoin_enabled) plugins.add(GitcoinPluginDefine)
    if (Flags.poll_enabled) plugins.add(PollsPluginDefine)
    if (Flags.trader_enabled) plugins.add(TraderPluginDefine)
    if (Flags.transak_enabled) plugins.add(TransakPluginDefine)
    if (Flags.airdrop_enabled) plugins.add(AirdropPluginDefine)
    if (Flags.snapshot_enabled) plugins.add(SnapShotPluginDefine)
    if (Flags.collectibles_enabled) plugins.add(CollectiblesPluginDefine)
    if (Flags.dhedge_enabled) plugins.add(DHedgePluginDefine)
    if (process.env.STORYBOOK) plugins.add(StorybookPluginDefine)
})
