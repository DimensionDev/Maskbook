import BigNumber from 'bignumber.js'
import Web3Utils, { AbiItem, AbiOutput } from 'web3-utils'
import { CONSTANTS } from './constants'
import { ChainId, EthereumTokenType, Token } from './types'
import { unreachable } from '../utils/utils'
import type { EventLog, TransactionReceipt } from 'web3-core'
import { nonFunctionalWeb3 } from './web3'

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

export function resolveLinkOnEtherscan(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'https://etherscan.io'
        case ChainId.Ropsten:
            return 'https://ropsten.etherscan.io'
        case ChainId.Rinkeby:
            return 'https://rinkeby.etherscan.io'
        case ChainId.Kovan:
            return 'https://kovan.etherscan.io'
        default:
            unreachable(chainId)
    }
}

export function resolveTransactionLinkOnEtherscan(chainId: ChainId, tx: string) {
    return `${resolveLinkOnEtherscan(chainId)}/tx/${tx}`
}

export function resolveTokenLinkOnEtherscan(token: Token) {
    return `${resolveLinkOnEtherscan(token.chainId)}/token/${token.address}`
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

export function decodeOutputString(abis: AbiOutput[], output: string) {
    if (abis.length === 1) return nonFunctionalWeb3.eth.abi.decodeParameter(abis[0], output)
    if (abis.length > 1) return nonFunctionalWeb3.eth.abi.decodeParameters(abis, output)
    return
}

export function decodeEvents(abis: AbiItem[], receipt: TransactionReceipt) {
    // the topic0 for identifying which abi to be used for decoding the event
    const listOfTopic0 = abis.map((abi) => Web3Utils.keccak256(`${abi.name}(${abi.inputs?.map((x) => x.type).join()})`))

    // decode events
    const events = receipt.logs.map((log) => {
        const idx = listOfTopic0.indexOf(log.topics[0])
        if (idx === -1) return
        const abis_ = abis[idx]?.inputs ?? []
        return {
            returnValues: nonFunctionalWeb3.eth.abi.decodeLog(abis_ ?? [], log.data, log.topics),
            raw: {
                data: log.data,
                topics: log.topics,
            },
            event: abis[idx].name,
            signature: listOfTopic0[idx],
            ...log,
        } as EventLog
    })

    console.log('DEBUG: decode events')
    console.log({
        listOfTopic0,
        receipt,
    })

    return events.reduce((accumulate, event) => {
        if (event) accumulate[event.event] = event
        return accumulate
    }, {} as { [eventName: string]: EventLog })
}
