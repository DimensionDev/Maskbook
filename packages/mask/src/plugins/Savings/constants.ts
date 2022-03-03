import { ChainId, createERC20Tokens, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export const SAVINGS_PLUGIN_NAME = 'Savings'
export const SAVINGS_PLUGIN_ID = 'com.savings'

export const LDO_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_ADDRESS', 'Lido DAO Token', 'LDO', 18)[ChainId.Mainnet],
    ],
]

export const AAVE_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createERC20Tokens('USDT_ADDRESS', 'Tether USD', 'USDT', 6)[ChainId.Mainnet],
        createERC20Tokens('aUSDT_ADDRESS', 'Aave Interest bearing USDT', 'aUSDT', 6)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('WBTC_ADDRESS', 'WBTC', 'WBTC', 8)[ChainId.Mainnet],
        createERC20Tokens('aWBTC_ADDRESS', 'aWBTC', 'aWBTC', 8)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('WETH_ADDRESS', 'WETH', 'WETH', 18)[ChainId.Mainnet],
        createERC20Tokens('aWETH_ADDRESS', 'aWETH', 'aWETH', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('YFI_ADDRESS', 'YFI', 'YFI', 18)[ChainId.Mainnet],
        createERC20Tokens('aYFI_ADDRESS', 'aYFI', 'aYFI', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('ZRX_ADDRESS', 'ZRX', 'ZRX', 18)[ChainId.Mainnet],
        createERC20Tokens('aZRX_ADDRESS', 'aZRX', 'aZRX', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('UNI_ADDRESS', 'UNI', 'UNI', 18)[ChainId.Mainnet],
        createERC20Tokens('aUNI_ADDRESS', 'aUNI', 'aUNI', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('AAVE_ADDRESS', 'AAVE', 'AAVE', 18)[ChainId.Mainnet],
        createERC20Tokens('aAAVE_ADDRESS', 'aAAVE', 'aAAVE', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('BAT_ADDRESS', 'BAT', 'BAT', 18)[ChainId.Mainnet],
        createERC20Tokens('aBAT_ADDRESS', 'aBAT', 'aBAT', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('BUSD_ADDRESS', 'BUSD', 'BUSD', 18)[ChainId.Mainnet],
        createERC20Tokens('aBUSD_ADDRESS', 'aBUSD', 'aBUSD', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('DAI_ADDRESS', 'DAI', 'DAI', 18)[ChainId.Mainnet],
        createERC20Tokens('aDAI_ADDRESS', 'aDAI', 'aDAI', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('ENJ_ADDRESS', 'ENJ', 'ENJ', 18)[ChainId.Mainnet],
        createERC20Tokens('aENJ_ADDRESS', 'aENJ', 'aENJ', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('KNC_ADDRESS', 'KNC', 'KNC', 18)[ChainId.Mainnet],
        createERC20Tokens('aKNC_ADDRESS', 'aKNC', 'aKNC', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('LINK_ADDRESS', 'LINK', 'LINK', 18)[ChainId.Mainnet],
        createERC20Tokens('aLINK_ADDRESS', 'aLINK', 'aLINK', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('MANA_ADDRESS', 'MANA', 'MANA', 18)[ChainId.Mainnet],
        createERC20Tokens('aMANA_ADDRESS', 'aMANA', 'aMANA', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('MKR_ADDRESS', 'MKR', 'MKR', 18)[ChainId.Mainnet],
        createERC20Tokens('aMKR_ADDRESS', 'aMKR', 'aMKR', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('REN_ADDRESS', 'REN', 'REN', 18)[ChainId.Mainnet],
        createERC20Tokens('aREN_ADDRESS', 'aREN', 'aREN', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('SNX_ADDRESS', 'SNX', 'SNX', 18)[ChainId.Mainnet],
        createERC20Tokens('aSNX_ADDRESS', 'aSNX', 'aSNX', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('sUSD_ADDRESS', 'sUSD', 'sUSD', 18)[ChainId.Mainnet],
        createERC20Tokens('aSUSD_ADDRESS', 'aSUSD', 'aSUSD', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('TUSD_ADDRESS', 'TUSD', 'TUSD', 18)[ChainId.Mainnet],
        createERC20Tokens('aTUSD_ADDRESS', 'aTUSD', 'aTUSD', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('USDC_ADDRESS', 'USDC', 'USDC', 6)[ChainId.Mainnet],
        createERC20Tokens('aUSDC_ADDRESS', 'aUSDC', 'aUSDC', 6)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('CRV_ADDRESS', 'CRV', 'CRV', 18)[ChainId.Mainnet],
        createERC20Tokens('aCRV_ADDRESS', 'aCRV', 'aCRV', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('GUSD_ADDRESS', 'GUSD', 'GUSD', 2)[ChainId.Mainnet],
        createERC20Tokens('aGUSD_ADDRESS', 'aGUSD', 'aGUSD', 2)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('BAL_ADDRESS', 'BAL', 'BAL', 18)[ChainId.Mainnet],
        createERC20Tokens('aBAL_ADDRESS', 'aBAL', 'aBAL', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('xSUSHI_ADDRESS', 'xSUSHI', 'xSUSHI', 18)[ChainId.Mainnet],
        createERC20Tokens('aXSUSHI_ADDRESS', 'aXSUSHI', 'aXSUSHI', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('renFIL_ADDRESS', 'renFIL', 'renFIL', 18)[ChainId.Mainnet],
        createERC20Tokens('aRENFIL_ADDRESS', 'aRENFIL', 'aRENFIL', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('RAI_ADDRESS', 'RAI', 'RAI', 18)[ChainId.Mainnet],
        createERC20Tokens('aRAI_ADDRESS', 'aRAI', 'aRAI', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('AMPL_ADDRESS', 'AMPL', 'AMPL', 9)[ChainId.Mainnet],
        createERC20Tokens('aAMPL_ADDRESS', 'aAMPL', 'aAMPL', 9)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('USDP_ADDRESS', 'USDP', 'USDP', 18)[ChainId.Mainnet],
        createERC20Tokens('aUSDP_ADDRESS', 'aUSDP', 'aUSDP', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('DPI_ADDRESS', 'DPI', 'DPI', 18)[ChainId.Mainnet],
        createERC20Tokens('aDPI_ADDRESS', 'aDPI', 'aDPI', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('FRAX_ADDRESS', 'FRAX', 'FRAX', 18)[ChainId.Mainnet],
        createERC20Tokens('aFRAX_ADDRESS', 'aFRAX', 'aFRAX', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('FEI_ADDRESS', 'FEI', 'FEI', 18)[ChainId.Mainnet],
        createERC20Tokens('aFEI_ADDRESS', 'aFEI', 'aFEI', 18)[ChainId.Mainnet],
    ],
    // {
    //     name: 'USDT',
    //     pair: 'aUSDT',
    //     decimals: 6,
    //     underLyingAssetName: 'aUSDT',
    //     logoURI: ['https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png'],
    // },
    // {
    //     name: 'WBTC',
    //     pair: 'aWBTC',
    //     decimals: 8,
    //     underLyingAssetName: 'aWBTC',
    //     logoURI: ['https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png'],
    // },
    // {
    //     name: 'WETH',
    //     pair: 'aWETH',
    //     decimals: 18,
    //     underLyingAssetName: 'aWETH',
    //     logoURI: ['https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png'],
    // },
    // {
    //     name: 'YFI',
    //     pair: 'aYFI',
    //     decimals: 18,
    //     underLyingAssetName: 'aYFI',
    //     logoURI: ['https://tokens.1inch.io/0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e.png'],
    // },
    // {
    //     name: 'ZRX',
    //     pair: 'aZRX',
    //     decimals: 18,
    //     underLyingAssetName: 'aZRX',
    //     logoURI: ['https://tokens.1inch.io/0xe41d2489571d322189246dafa5ebde1f4699f498.png'],
    // },
    // {
    //     name: 'UNI',
    //     pair: 'aUNI',
    //     decimals: 18,
    //     underLyingAssetName: 'aUNI',
    //     logoURI: ['https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png'],
    // },
    // {
    //     name: 'AAVE',
    //     pair: 'aAAVE',
    //     decimals: 18,
    //     underLyingAssetName: 'aAAVE',
    //     logoURI: ['https://tokens.1inch.io/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.png'],
    // },
    // {
    //     name: 'BAT',
    //     pair: 'aBAT',
    //     decimals: 18,
    //     underLyingAssetName: 'aBAT',
    //     logoURI: ['https://tokens.1inch.io/0x0d8775f648430679a709e98d2b0cb6250d2887ef.png'],
    // },
    // {
    //     name: 'BUSD',
    //     pair: 'aBUSD',
    //     decimals: 18,
    //     underLyingAssetName: 'aBUSD',
    //     logoURI: ['https://tokens.1inch.io/0x4fabb145d64652a948d72533023f6e7a623c7c53.png'],
    // },
    // {
    //     name: 'DAI',
    //     pair: 'aDAI',
    //     decimals: 18,
    //     underLyingAssetName: 'aDAI',
    //     logoURI: ['https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png'],
    // },
    // {
    //     name: 'ENJ',
    //     pair: 'aENJ',
    //     decimals: 18,
    //     underLyingAssetName: 'aENJ',
    //     logoURI: ['https://tokens.1inch.io/0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c.png'],
    // },
    // {
    //     name: 'KNC',
    //     pair: 'aKNC',
    //     decimals: 18,
    //     underLyingAssetName: 'aKNC',
    //     logoURI: ['https://tokens.1inch.io/0xdd974d5c2e2928dea5f71b9825b8b646686bd200.png'],
    // },
    // {
    //     name: 'LINK',
    //     pair: 'aLINK',
    //     decimals: 18,
    //     underLyingAssetName: 'aLINK',
    //     logoURI: ['https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png'],
    // },
    // {
    //     name: 'MANA',
    //     pair: 'aMANA',
    //     decimals: 18,
    //     underLyingAssetName: 'aMANA',
    //     logoURI: ['https://tokens.1inch.io/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png'],
    // },
    // {
    //     name: 'MKR',
    //     pair: 'aMKR',
    //     decimals: 18,
    //     underLyingAssetName: 'aMKR',
    //     logoURI: ['https://tokens.1inch.io/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png'],
    // },
    // {
    //     name: 'REN',
    //     pair: 'aREN',
    //     decimals: 18,
    //     underLyingAssetName: 'aREN',
    //     logoURI: ['https://tokens.1inch.io/0x408e41876cccdc0f92210600ef50372656052a38.png'],
    // },
    // {
    //     name: 'SNX',
    //     pair: 'aSNX',
    //     decimals: 18,
    //     underLyingAssetName: 'aSNX',
    //     logoURI: ['https://tokens.1inch.io/0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f.png'],
    // },
    // {
    //     name: 'sUSD',
    //     pair: 'aSUSD',
    //     decimals: 18,
    //     underLyingAssetName: 'aSUSD',
    //     logoURI: ['https://tokens.1inch.io/0x57ab1ec28d129707052df4df418d58a2d46d5f51.png'],
    // },
    // {
    //     name: 'TUSD',
    //     pair: 'aTUSD',
    //     decimals: 18,
    //     underLyingAssetName: 'aTUSD',
    //     logoURI: ['https://tokens.1inch.io/0x0000000000085d4780b73119b644ae5ecd22b376.png'],
    // },
    // {
    //     name: 'USDC',
    //     pair: 'aUSDC',
    //     decimals: 6,
    //     underLyingAssetName: 'aUSDC',
    //     logoURI: ['https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'],
    // },
    // {
    //     name: 'CRV',
    //     pair: 'aCRV',
    //     decimals: 18,
    //     underLyingAssetName: 'aCRV',
    //     logoURI: ['https://tokens.1inch.io/0xd533a949740bb3306d119cc777fa900ba034cd52.png'],
    // },
    // {
    //     name: 'GUSD',
    //     pair: 'aGUSD',
    //     decimals: 2,
    //     underLyingAssetName: 'aGUSD',
    //     logoURI: ['https://tokens.1inch.io/0x056fd409e1d7a124bd7017459dfea2f387b6d5cd.png'],
    // },
    // {
    //     name: 'BAL',
    //     pair: 'aBAL',
    //     decimals: 18,
    //     underLyingAssetName: 'aBAL',
    //     logoURI: ['https://tokens.1inch.io/0xba100000625a3754423978a60c9317c58a424e3d.png'],
    // },
    // {
    //     name: 'xSUSHI',
    //     pair: 'aXSUSHI',
    //     decimals: 18,
    //     underLyingAssetName: 'aXSUSHI',
    //     logoURI: ['https://tokens.1inch.io/0x8798249c2e607446efb7ad49ec89dd1865ff4272.png'],
    // },
    // {
    //     name: 'renFIL',
    //     pair: 'aRENFIL',
    //     decimals: 18,
    //     underLyingAssetName: 'aRENFIL',
    //     logoURI: ['https://tokens.1inch.io/0xd5147bc8e386d91cc5dbe72099dac6c9b99276f5.png'],
    // },
    // {
    //     name: 'RAI',
    //     pair: 'aRAI',
    //     decimals: 18,
    //     underLyingAssetName: 'aRAI',
    //     logoURI: ['https://tokens.1inch.io/0x03ab458634910aad20ef5f1c8ee96f1d6ac54919.png'],
    // },
    // {
    //     name: 'AMPL',
    //     pair: 'aAMPL',
    //     decimals: 9,
    //     underLyingAssetName: 'aAMPL',
    //     logoURI: ['https://tokens.1inch.io/0xd46ba6d942050d489dbd938a2c909a5d5039a161.png'],
    // },
    // {
    //     name: 'USDP',
    //     pair: 'aUSDP',
    //     decimals: 18,
    //     underLyingAssetName: 'aUSDP',
    //     logoURI: ['https://tokens.1inch.io/0x8e870d67f660d95d5be530380d0ec0bd388289e1.png'],
    // },
    // {
    //     name: 'DPI',
    //     pair: 'aDPI',
    //     decimals: 18,
    //     underLyingAssetName: 'aDPI',
    //     logoURI: ['https://tokens.1inch.io/0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b.png'],
    // },
    // {
    //     name: 'FRAX',
    //     pair: 'aFRAX',
    //     decimals: 18,
    //     underLyingAssetName: 'aFRAX',
    //     logoURI: ['https://tokens.1inch.io/0x853d955acef822db058eb8505911ed77f175b99e.png'],
    // },
    // {
    //     name: 'FEI',
    //     pair: 'aFEI',
    //     decimals: 18,
    //     underLyingAssetName: 'aFEI',
    //     logoURI: ['https://tokens.1inch.io/0x956f47f50a910163d8bf957cf5846d573e7f87ca.png'],
    // },
]
