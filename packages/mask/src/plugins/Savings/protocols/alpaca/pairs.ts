import {
    ChainId,
    createERC20Token,
    createNativeToken,
    FungibleTokenDetailed,
    USDT,
    BTCB,
    USDC,
    ETHER,
    BUSD,
} from '@masknet/web3-shared-evm'

import { AlpacaProtocol } from './AlpacaProtocol'

export const PAIRS_LIST: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    // BNB-ibBNB
    [
        createNativeToken(ChainId.BSC),
        createERC20Token(
            ChainId.BSC,
            '0xd7D069493685A581d27824Fc46EdA46B7EfC0063',
            18,
            'Interest Bearing BNB',
            'ibBNB',
        ),
    ],
    // BUSD-ibBUSD
    [
        BUSD[ChainId.BSC],
        createERC20Token(
            ChainId.BSC,
            '0x7C9e73d4C71dae564d41F78d56439bB4ba87592f',
            18,
            'Interest Bearing BUSD',
            'ibBUSD',
        ),
    ],
    // ETH-ibETH
    [
        ETHER[ChainId.BSC],
        createERC20Token(
            ChainId.BSC,
            '0xbfF4a34A4644a113E8200D7F1D79b3555f723AfE',
            18,
            'Interest Bearing ETH',
            'ibETH',
        ),
    ],
    // ALPACA-ibALPACA
    [
        createERC20Token(ChainId.BSC, '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F', 18, 'AlpacaToken', 'ALPACA'),
        createERC20Token(
            ChainId.BSC,
            '0xf1bE8ecC990cBcb90e166b71E368299f0116d421',
            18,
            'Interest Bearing ALPACA',
            'ibALPACA',
        ),
    ],
    // USDT-ibUSDT
    [
        USDT[ChainId.BSC],
        createERC20Token(
            ChainId.BSC,
            '0x158Da805682BdC8ee32d52833aD41E74bb951E59',
            18,
            'Interest Bearing USDT',
            'ibUSDT',
        ),
    ],
    // BTCB-ibBTCB
    [
        BTCB[ChainId.BSC],
        createERC20Token(
            ChainId.BSC,
            '0x08FC9Ba2cAc74742177e0afC3dC8Aed6961c24e7',
            18,
            'Interest Bearing BTCB',
            'qiBTCB',
        ),
    ],
    // USDC-ibUSDC
    [
        USDC[ChainId.BSC],
        createERC20Token(
            ChainId.BSC,
            '0x800933D685E7Dc753758cEb77C8bd34aBF1E26d7',
            18,
            'Interest Bearing USDC',
            'ibUSDC',
        ),
    ],
]

export const ALPACA_PAIRS = PAIRS_LIST.map((pair) => new AlpacaProtocol(pair))
