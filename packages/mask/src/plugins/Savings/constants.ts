import { ChainId, createERC20Tokens, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export const SAVINGS_PLUGIN_NAME = 'Savings'
export const SAVINGS_PLUGIN_ID = 'com.savings'

export const LDO_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_stETH_ADDRESS', 'Liquid staked Ether 2.0', 'stETH', 18)[ChainId.Mainnet],
    ],
]

export const BENQI_COMPTROLLER = '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4'
export const COMPOUND_COMPTROLLER = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'

// from https://app.aurigami.finance/assets/vendor.1efcd1de.js  search: 'COMPTROLLER:'
export const AURIGAMI_COMPTROLLER = '0x817af6cfAF35BdC1A634d6cC94eE9e4c68369Aeb'
export const AURIGAMI_ORACLE = '0xC6e5185438e1730959c1eF3551059A3feC744E90'
export const AURIGAMI_LENS = '0xC41a5C1625d492436600789469c1CE2eA20CEA6B'

// from https://github.com/vfat-tools/vfat-tools/blob/6329bce901461f1320afa06d5daf95fc4bcd1cec/src/static/js/harmony_tranquil.js#L135
export const TRANQUIL_COMPTROLLER = '0x6a82A17B48EF6be278BBC56138F35d04594587E3'
export const TRANQUIL_Oracle = '0x0C99E05CD2dCb52A583a3694F4d91813eFb5B071'
export const TRANQ_ADDRESS = '0xcf1709ad76a79d5a60210f23e81ce2460542a836'
