import { ChainId, createERC20Tokens, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export const SAVINGS_PLUGIN_NAME = 'Savings'
export const SAVINGS_PLUGIN_ID = 'com.savings'

export const LDO_PAIRS: Array<[FungibleTokenDetailed, FungibleTokenDetailed]> = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_stETH_ADDRESS', 'Liquid staked Ether 2.0', 'stETH', 18)[ChainId.Mainnet],
    ],
]

export const AAVE_PAIRS: Array<[FungibleTokenDetailed, FungibleTokenDetailed]> = [
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
]
