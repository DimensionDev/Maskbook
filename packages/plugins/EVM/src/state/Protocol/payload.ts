import type { AbiItem } from 'web3-utils'
import * as ABICoder from 'web3-eth-abi'
import type { JsonRpcPayload } from 'web3-core-helpers'
import {
    isSameAddress,
    ComputedPayload,
    EthereumRpcType,
    EthereumMethodType,
    getChainDetailedCAIP,
    isZeroAddress,
    EthereumTransactionConfig,
    getPayloadConfig,
    isEmptyHex,
    getData,
    getTo,
    getFunctionSignature,
    getFunctionParameters,
} from '@masknet/web3-shared-evm'
import { isZero } from '@masknet/web3-shared-base'
import type { EVM_Connection } from './types'

// built-in abis
import BulkCheckout from '@masknet/web3-contracts/abis/BulkCheckout.json'
import ITO2 from '@masknet/web3-contracts/abis/ITO2.json'
import NftHappyRedPacket from '@masknet/web3-contracts/abis/NftHappyRedPacket.json'
import HappyRedPacketV4 from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import ERC20 from '@masknet/web3-contracts/abis/ERC20.json'
import RouterV2ABI from '@masknet/web3-contracts/abis/RouterV2.json'
import SwapRouter from '@masknet/web3-contracts/abis/SwapRouter.json'
import MaskBox from '@masknet/web3-contracts/abis/MaskBox.json'

interface InternalItem {
    name: string
    parameters: {
        name: string
        type: string
    }[]
}

class ABI {
    private coder = ABICoder as unknown as ABICoder.AbiCoder
    private ABI_MAP: Map<string, InternalItem> = new Map()

    read(signature?: string) {
        if (!signature) return
        return this.ABI_MAP.get(signature)
    }
    construct(abi: AbiItem[]) {
        abi.forEach((x) => {
            if (x.type !== 'function') return
            if (x.stateMutability === 'pure' || x.stateMutability === 'view') return
            const { name, inputs = [] } = x
            if (!name) return
            try {
                const signature = this.coder.encodeFunctionSignature(
                    `${x.name}(${inputs.map((y) => y.type).join(',')})`,
                )
                if (this.ABI_MAP.has(signature))
                    console.warn(
                        `The signature of ${`${x.name}(${inputs.map((y) => y.type).join(',')})`} already exists.`,
                    )
                this.ABI_MAP.set(signature, {
                    name,
                    parameters:
                        inputs.map((y) => ({
                            name: y.name,
                            type: y.type,
                        })) ?? [],
                })
            } catch (error) {
                console.log('Failed to encode function signature from below ABI:')
                console.log(x)
            }
        })
    }
}

export class PayloadComputer {
    private abi = new ABI()
    private coder = ABICoder as unknown as ABICoder.AbiCoder

    constructor(private connection: EVM_Connection) {
        this.abi.construct(BulkCheckout as AbiItem[]) // donate gitcoin grants
        this.abi.construct(ITO2 as AbiItem[])
        this.abi.construct(NftHappyRedPacket as AbiItem[])
        this.abi.construct(HappyRedPacketV4 as AbiItem[])
        this.abi.construct(MaskBox as AbiItem[])
        this.abi.construct(ERC20 as AbiItem[])
        this.abi.construct(RouterV2ABI as AbiItem[]) // uniswap V2 like
        this.abi.construct(SwapRouter as AbiItem[]) // uniswap V3 like
    }

    async getComputedPayload(payload: JsonRpcPayload): Promise<ComputedPayload | undefined> {
        switch (payload.method) {
            // sign
            case EthereumMethodType.ETH_SIGN:
            case EthereumMethodType.PERSONAL_SIGN:
                return {
                    type: EthereumRpcType.SIGN,
                    to: payload.params![1],
                    data: payload.params![0],
                }
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                return {
                    type: EthereumRpcType.SIGN_TYPED_DATA,
                    to: payload.params![0],
                    data: payload.params![1],
                }

            // decrypt
            case EthereumMethodType.ETH_DECRYPT:
                return {
                    type: EthereumRpcType.ETH_DECRYPT,
                    to: payload.params![1],
                    secret: payload.params![0],
                }
            case EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY:
                return {
                    type: EthereumRpcType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
                    account: payload.params![0],
                }

            // asset
            case EthereumMethodType.WATCH_ASSET:
            case EthereumMethodType.WATCH_ASSET_LEGACY:
                return {
                    type: EthereumRpcType.WATCH_ASSET,
                    asset: payload.params![0],
                }

            // wallet
            case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
                return {
                    type: EthereumRpcType.WALLET_SWITCH_ETHEREUM_CHAIN,
                    chain: getChainDetailedCAIP(Number.parseInt(payload.params![0], 16)),
                }
            case EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN:
                return {
                    type: EthereumRpcType.WALLET_SWITCH_ETHEREUM_CHAIN,
                    chain: payload.params![0],
                }

            // contract interaction
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                return this.getSendTransactionComputedPayload(getPayloadConfig(payload))

            default:
                return
        }
    }

    async getSendTransactionComputedPayload(config?: EthereumTransactionConfig): Promise<ComputedPayload | undefined> {
        if (!config) return

        const from = (config.from as string | undefined) ?? ''
        const value = (config.value as string | undefined) ?? '0x0'
        const data = getData(config)
        const to = getTo(config)
        const signature = getFunctionSignature(config)
        const parameters = getFunctionParameters(config)

        if (data) {
            // contract interaction
            const abi = this.abi.read(signature)

            if (abi) {
                try {
                    return {
                        type: EthereumRpcType.CONTRACT_INTERACTION,
                        name: abi.name,
                        parameters: this.coder.decodeParameters(abi.parameters, parameters ?? ''),
                        _tx: config,
                    }
                } catch {
                    // do nothing
                }
            }

            // contract deployment
            if (isZeroAddress(to)) {
                return {
                    type: EthereumRpcType.CONTRACT_DEPLOYMENT,
                    code: data,
                    _tx: config,
                }
            }
        }

        if (to) {
            let code = ''
            try {
                code = await this.connection.getCode(to)
            } catch {
                code = ''
            }

            // cancel tx
            if (isSameAddress(from, to) && isZero(value)) {
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
                    name: 'unknown',
                    _tx: config,
                }
            }
        }

        return
    }
}
