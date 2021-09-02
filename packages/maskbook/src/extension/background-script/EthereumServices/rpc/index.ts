import * as ABICoder from 'web3-eth-abi'
import {
    EthereumRpcComputed,
    EthereumTransactionConfig,
    EthereumRpcType,
    EthereumMethodType,
    getChainDetailedCAIP,
} from '@masknet/web3-shared'
import { getCode } from '../network'
import type { JsonRpcPayload } from 'web3-core-helpers'
import ABI_LIST from './abi_list.json'

type AbiItem = {
    name: string
    parameters: {
        name: string
        type: string
    }[]
}

// fix the type eror
const coder = ABICoder as unknown as ABICoder.AbiCoder

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

const ABI_LIST_WITH_SIGNATURE = (ABI_LIST as AbiItem[]).map((x) => ({
    ...x,
    signature: coder.encodeFunctionSignature(`${x.name}(${x.parameters.join(',')})`),
}))

function isEmptyHex(hex: string) {
    return !hex || ['0x', '0x0'].includes(hex)
}

function getData(tx: EthereumTransactionConfig) {
    const { data } = tx
    if (!data) return
    if (isEmptyHex(data)) return
    if (!data.startsWith('0x')) return `0x${data}`
    return data
}

function getTo(tx: EthereumTransactionConfig) {
    const { to } = tx
    if (!to) return ADDRESS_ZERO
    if (isEmptyHex(to)) return ADDRESS_ZERO
    return to
}

function getFunctionSignature(tx: EthereumTransactionConfig) {
    const data = getData(tx)
    return data?.slice(0, 10)
}

function getFunctionParameters(tx: EthereumTransactionConfig) {
    const data = getData(tx)
    return data?.slice(10)
}

export async function getJsonRpcComputed(payload: JsonRpcPayload): Promise<EthereumRpcComputed | undefined> {
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

        // contract interation
        case EthereumMethodType.ETH_SEND_TRANSACTION:
            return getSendTransactionRpcComputed(payload.params[0])

        default:
            return
    }
}

export async function getSendTransactionRpcComputed(
    tx: EthereumTransactionConfig,
): Promise<EthereumRpcComputed | undefined> {
    const data = getData(tx)
    const to = getTo(tx)
    const signature = getFunctionSignature(tx)
    const parameters = getFunctionParameters(tx)

    if (data) {
        // contract interaction
        const abi = ABI_LIST_WITH_SIGNATURE.find((x) => x.signature === signature)

        if (abi) {
            try {
                return {
                    type: EthereumRpcType.CONTRACT_INTERACTION,
                    name: abi.name,
                    parameters: coder.decodeParameters(abi.parameters, parameters ?? ''),
                    _tx: tx,
                }
            } catch {
                // do nothing
            }
        }

        // contract deployment
        if (to === ADDRESS_ZERO) {
            return {
                type: EthereumRpcType.CONTRACT_DEPLOYMENT,
                code: data,
                _tx: tx,
            }
        }
    }

    if (to) {
        const code = await getCode(to)

        // send ether
        if (isEmptyHex(code)) {
            return {
                type: EthereumRpcType.SEND_ETHER,
                _tx: tx,
                //tx.to === account
            }
        } else {
            return {
                type: EthereumRpcType.CONTRACT_INTERACTION,
                name: 'Unknown',
                _tx: tx,

                //tx.to == token address
            }
        }
    }

    return
}
