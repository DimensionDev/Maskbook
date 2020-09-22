import BigNumber from 'bignumber.js'
import type { AbiOutput } from 'web3-utils'
import { CONSTANTS } from './constants'
import { ChainId, EthereumTokenType, Token } from './types'
import type Web3 from 'web3'
import { unreachable } from '../utils/utils'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function isETH(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'ETH_ADDRESS'))
}

export function isDAI(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'DAI_ADDRESS'))
}

export function isOKB(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'OBK_ADDRESS'))
}

export function isUSDT(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'USDT_ADDRESS'))
}

export function addGasMargin(value: BigNumber) {
    return value.multipliedBy(new BigNumber(10000).plus(new BigNumber(1000))).dividedToIntegerBy(new BigNumber(10000))
}

//#region constants
type Primitive = string | boolean | number
type EnumRecord<T extends number, U> = {
    [K in T]: U
}
export interface Web3Constants {
    [K: string]: EnumRecord<ChainId, Primitive | Primitive[]>
}

export function getConstant<T extends Web3Constants, K extends keyof T>(
    constants: T,
    key: K,
    chainId = ChainId.Mainnet,
): T[K][ChainId.Mainnet] {
    return constants[key][chainId]
}

export function getAllConstants<T extends Web3Constants, K extends keyof T>(constants: T, chainId = ChainId.Mainnet) {
    return Object.entries(constants).reduce(
        (accumulate, [key, value]) => {
            accumulate[key as K] = value[chainId]
            return accumulate
        },
        {} as {
            [U in K]: T[U][ChainId.Mainnet]
        },
    )
}
//#endregion

//#region token
export function resolveTokenLinkInEtherscan(token: Token) {
    switch (token.chainId) {
        case ChainId.Mainnet:
            return `https://etherscan.io/token/${token.address}`
        case ChainId.Ropsten:
            return `https://ropsten.etherscan.io/token/${token.address}`
        case ChainId.Rinkeby:
            return `https://rinkeby.etherscan.io/token/${token.address}`
        case ChainId.Kovan:
            return `https://kovan.etherscan.io/token/${token.address}`
        default:
            unreachable(token.chainId)
    }
}

export function createEetherToken(chainId: ChainId): Token {
    return {
        type: EthereumTokenType.Ether,
        chainId,
        address: getConstant(CONSTANTS, 'ETH_ADDRESS'),
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    }
}

export function createERC20Token(
    chainId: ChainId,
    address: string,
    decimals: number,
    name: string,
    symbol: string,
): Token {
    return {
        type: EthereumTokenType.ERC20,
        chainId,
        address,
        decimals,
        name,
        symbol,
    }
}
//#endregion

export function decodeOutputString(web3: Web3, abi: AbiOutput[], output: string) {
    if (abi.length === 1) return web3.eth.abi.decodeParameter(abi[0].type, output)
    if (abi.length > 1)
        return web3.eth.abi.decodeParameters(
            abi.map((x) => x.type),
            output,
        )
    return
}
