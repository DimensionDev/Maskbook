import BigNumber from 'bignumber.js'
import * as ABICoder from 'web3-eth-abi'
import {
    isSameAddress,
    EthereumRpcComputed,
    EthereumRpcType,
    EthereumMethodType,
    getChainDetailedCAIP,
    getTokenConstants,
} from '@masknet/web3-shared-evm'
import type { TransactionConfig } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { getCode } from '../network'
import { readABI } from './abi'

// fix the type error
const coder = ABICoder as unknown as ABICoder.AbiCoder

const { ZERO_ADDRESS = '' } = getTokenConstants()

function isEmptyHex(hex: string) {
    return !hex || ['0x', '0x0'].includes(hex)
}

function getData(tx: TransactionConfig) {
    const { data } = tx
    if (!data) return
    if (isEmptyHex(data)) return
    if (!data.startsWith('0x')) return `0x${data}`
    return data
}

function getTo(tx: TransactionConfig) {
    const { to } = tx
    if (!to) return ZERO_ADDRESS
    if (isEmptyHex(to)) return ZERO_ADDRESS
    return to
}

function getFunctionSignature(tx: TransactionConfig) {
    const data = getData(tx)
    return data?.slice(0, 10)
}

function getFunctionParameters(tx: TransactionConfig) {
    const data = getData(tx)
    return data?.slice(10)
}

export async function getComputedPayload(payload: JsonRpcPayload): Promise<EthereumRpcComputed | undefined> {
    switch (payload.method) {
        // sign
        case EthereumMethodType.ETH_SIGN:
        case EthereumMethodType.PERSONAL_SIGN:
            return {
                type: EthereumRpcType.SIGN,
                to: payload.params[1],
                data: payload.params[0],
            }
        case EthereumMethodType.ETH_SIGN_TYPED_DATA:
            return {
                type: EthereumRpcType.SIGN_TYPED_DATA,
                to: payload.params[1],
                data: payload.params[0],
            }

        // decrypt
        case EthereumMethodType.ETH_DECRYPT:
            return {
                type: EthereumRpcType.ETH_DECRYPT,
                to: payload.params[1],
                secret: payload.params[0],
            }
        case EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY:
            return {
                type: EthereumRpcType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
                account: payload.params[0],
            }

        // asset
        case EthereumMethodType.WATCH_ASSET:
        case EthereumMethodType.WATCH_ASSET_LEGACY:
            return {
                type: EthereumRpcType.WATCH_ASSET,
                asset: payload.params[0],
            }

        // wallet
        case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
            return {
                type: EthereumRpcType.WALLET_SWITCH_ETHEREUM_CHAIN,
                chain: getChainDetailedCAIP(Number.parseInt(payload.params[0], 16)),
            }
        case EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN:
            return {
                type: EthereumRpcType.WALLET_SWITCH_ETHEREUM_CHAIN,
                chain: payload.params[0],
            }

        // contract interaction
        case EthereumMethodType.ETH_SEND_TRANSACTION:
            return getSendTransactionComputedPayload(payload) as Promise<EthereumRpcComputed | undefined>

        default:
            return
    }
}

export async function getSendTransactionComputedPayload(payload: JsonRpcPayload) {
    const config =
        payload.method === EthereumMethodType.MASK_REPLACE_TRANSACTION ? payload.params[1] : payload.params[0]
    const from = (config.from as string | undefined) ?? ''
    const value = (config.value as string | undefined) ?? '0x0'
    const data = getData(config)
    const to = getTo(config)
    const signature = getFunctionSignature(config)
    const parameters = getFunctionParameters(config)

    if (data) {
        // contract interaction
        const abi = readABI(signature)

        if (abi) {
            try {
                return {
                    type: EthereumRpcType.CONTRACT_INTERACTION,
                    name: abi.name,
                    parameters: coder.decodeParameters(abi.parameters, parameters ?? ''),
                    _tx: config,
                }
            } catch {
                // do nothing
            }
        }

        // contract deployment
        if (isSameAddress(to, ZERO_ADDRESS)) {
            return {
                type: EthereumRpcType.CONTRACT_DEPLOYMENT,
                code: data,
                _tx: config,
            }
        }
    }

    if (to) {
        let code: string = ''
        try {
            code = await getCode(to)
        } catch {
            code = ''
        }

        // cancel tx
        if (isSameAddress(from, to) && new BigNumber(value).isZero()) {
            return {
                type: EthereumRpcType.CANCEL,
                _tx: config,
            }
        }

        // send ether
        if (isEmptyHex(code)) {
            return {
                type: EthereumRpcType.SEND_ETHER,
                _tx: config,
            }
        } else {
            return {
                type: EthereumRpcType.CONTRACT_INTERACTION,
                name: 'Unknown',
                _tx: config,
            }
        }
    }

    return
}
