import type Web3 from 'web3'
import type { EventLog, TransactionReceipt } from 'web3-core'
import Web3Utils, { AbiItem, AbiOutput } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { CONSTANTS } from './constants'
import { ChainId, EthereumTokenType, Token } from './types'
import { unreachable } from '../utils/utils'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function isDAI(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'DAI_ADDRESS'))
}

export function isOKB(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'OBK_ADDRESS'))
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

export function decodeOutputString(web3: Web3, abis: AbiOutput[], output: string) {
    if (abis.length === 1) return web3.eth.abi.decodeParameter(abis[0], output)
    if (abis.length > 1) return web3.eth.abi.decodeParameters(abis, output)
    return
}

export function decodeEvents(web3: Web3, abis: AbiItem[], receipt: TransactionReceipt) {
    // the topic0 for identifying which abi to be used for decoding the event
    const listOfTopic0 = abis.map((abi) => Web3Utils.keccak256(`${abi.name}(${abi.inputs?.map((x) => x.type).join()})`))

    // decode events
    const events = receipt.logs.map((log) => {
        const idx = listOfTopic0.indexOf(log.topics[0])
        if (idx === -1) return
        const abi = abis[idx]
        const inputs = abi?.inputs ?? []
        return {
            // more: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-abi.html?highlight=decodeLog#decodelog
            returnValues: web3.eth.abi.decodeLog(inputs, log.data, abi.anonymous ? log.topics : log.topics.slice(1)),
            raw: {
                data: log.data,
                topics: log.topics,
            },
            event: abi.name,
            signature: listOfTopic0[idx],
            ...log,
        } as EventLog
    })
    return events.reduce((accumulate, event) => {
        if (event) accumulate[event.event] = event
        return accumulate
    }, {} as { [eventName: string]: EventLog })
}
