import { PluginID } from '@masknet/shared-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { CHAIN_DESCRIPTORS, ChainId, createERC20Tokens, type SchemaType } from '@masknet/web3-shared-evm'

export const SAVINGS_PLUGIN_ID = PluginID.Savings

export const LDO_PAIRS: Array<[FungibleToken<ChainId, SchemaType>, FungibleToken<ChainId, SchemaType>]> = [
    [
        CHAIN_DESCRIPTORS.find((x) => x.chainId === ChainId.Mainnet)!.nativeCurrency,
        createERC20Tokens('LDO_stETH_ADDRESS', 'Liquid staked Ether 2.0', 'stETH', 18)[ChainId.Mainnet],
    ],
]
