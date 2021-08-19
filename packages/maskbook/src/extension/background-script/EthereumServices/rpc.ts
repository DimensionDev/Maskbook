import { AbiCoder } from 'web3-eth-abi'
import {
    EthereumRpcComputed,
    EthereumTransactionConfig,
    EthereumRpcType,
    EthereumTokenType,
    EthereumMethodType,
} from '@masknet/web3-shared'
import { getCode } from './network'
import type { JsonRpcPayload } from 'web3-core-helpers'

const abiCoder = new AbiCoder()

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

const BUILT_IN_CONTRACT_INTERACTION_ABI_LIST = [
    // ERC20 contract
    {
        name: 'approve',
        prameters: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        name: 'transfer',
        prameters: [
            {
                name: 'to',
                type: 'address',
            },
            {
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        name: 'transferFrom',
        prameters: [
            {
                name: 'from',
                type: 'address',
            },
            {
                name: 'to',
                type: 'address',
            },
            {
                name: 'value',
                type: 'uint256',
            },
        ],
    },
].map((x) => ({
    ...x,
    signature: abiCoder.encodeFunctionSignature(`${x.name}(${x.prameters.join(',')})`),
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
        case EthereumMethodType.ETH_SIGN:
            return {
                type: EthereumRpcType.SIGN,
                to: payload.params[1],
                data: payload.params[0],
            }
        case EthereumMethodType.PERSONAL_SIGN:
            return {
                type: EthereumRpcType.SIGN_PERSONAL,
                to: payload.params[1],
                data: payload.params[0],
            }
        case EthereumMethodType.ETH_SIGN_TYPED_DATA:
            return {
                type: EthereumRpcType.SIGN_TYPED_DATA,
                to: payload.params[1],
                data: payload.params[0],
            }
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
        case EthereumMethodType.ETH_SEND_TRANSACTION:
            const config = payload.params[0] as EthereumTransactionConfig
            return getSendTransactionRpcComputed(config)
        default:
            return
    }
}

export async function getSendTransactionRpcComputed(tx: EthereumTransactionConfig): Promise<EthereumRpcComputed | undefined> {
    const data = getData(tx)
    const to = getTo(tx)
    const signature = getFunctionSignature(tx)
    const parameters = getFunctionParameters(tx)

    if (data) {
        // contract interaction
        const abi = BUILT_IN_CONTRACT_INTERACTION_ABI_LIST.find((x) => x.signature === signature)

        if (abi) {
            try {
                return {
                    type: EthereumRpcType.CONTRACT_INTERACTION,
                    name: abi.name,
                    parameters: abiCoder.decodeParameters(abi.prameters, parameters ?? ''),
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
            }
        } else {
            return {
                type: EthereumRpcType.CONTRACT_INTERACTION,
                name: 'Unknown',
                _tx: tx,
            }
        }
    }

    return
}
