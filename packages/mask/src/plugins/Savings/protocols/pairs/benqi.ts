import {
    ChainId,
    createERC20Tokens,
    createERC20Token,
    createNativeToken,
    FungibleTokenDetailed,
} from '@masknet/web3-shared-evm'

import { BenQiProtocol } from '../BenQiProtocol'

export const BENQI_PAIRS_LIST: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createNativeToken(ChainId.Avalanche),
        createERC20Token(ChainId.Avalanche, '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c', 8, 'Benqi AVAX', 'qiAVAX'),
    ],
    [
        createERC20Tokens('WBTC_ADDRESS', 'Wrapped BTC', 'WBTC.e', 8)[ChainId.Avalanche],
        createERC20Token(ChainId.Avalanche, '0xe194c4c5aC32a3C9ffDb358d9Bfd523a0B6d1568', 8, 'Benqi BTC', 'qiBTC'),
    ],
    [
        createERC20Token(
            ChainId.Avalanche,
            '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
            18,
            'Wrapped Ether',
            'WETH.e',
        ),
        createERC20Token(ChainId.Avalanche, '0x334AD834Cd4481BB02d09615E7c11a00579A7909', 8, 'Benqi ETH', 'qiETH'),
    ],
    [
        createERC20Token(ChainId.Avalanche, '0xc7198437980c041c805a1edcba50c1ce5db95118', 6, 'Tether USD', 'USDT.e'),
        createERC20Token(ChainId.Avalanche, '0xc9e5999b8e75C3fEB117F6f73E664b9f3C8ca65C', 8, 'Benqi USDT', 'qiUSDT'),
    ],
    [
        createERC20Token(
            ChainId.Avalanche,
            '0x5947bb275c521040051d82396192181b413227a3',
            18,
            'Chainlink Token',
            'LINK.e',
        ),
        createERC20Token(ChainId.Avalanche, '0x4e9f683A27a6BdAD3FC2764003759277e93696e6', 8, 'Benqi LINK', 'qiLINK'),
    ],
    [
        createERC20Token(ChainId.Avalanche, '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', 6, 'USD Coin', 'USDC.e'),
        createERC20Token(ChainId.Avalanche, '0xBEb5d47A3f720Ec0a390d04b4d41ED7d9688bC7F', 8, 'Benqi USDC', 'qiUSDC'),
    ],
    [
        createERC20Token(
            ChainId.Avalanche,
            '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
            18,
            'Dai Stablecoin',
            'DAI.e',
        ),
        createERC20Token(ChainId.Avalanche, '0x835866d37AFB8CB8F8334dCCdaf66cf01832Ff5D', 8, 'Benqi DAI', 'qiDAI'),
    ],
    [
        createERC20Token(ChainId.Avalanche, '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5', 18, 'BENQI', 'QI'),
        createERC20Token(ChainId.Avalanche, '0x35Bd6aedA81a7E5FC7A7832490e71F757b0cD9Ce', 8, 'Benqi QI', 'qiQI'),
    ],
]

export const BENQI_PAIRS = BENQI_PAIRS_LIST.map((pair) => new BenQiProtocol(pair))
