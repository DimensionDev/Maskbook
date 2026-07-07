import { useCallback } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { NetworkPluginID, toHex } from '@masknet/shared-base'
import { useChainContext, useEnvironmentContext } from '@masknet/web3-hooks-base'
import { type FungibleToken, isLessThan, toFixed } from '@masknet/web3-shared-base'
import {
    type ChainId,
    SchemaType,
    useTokenConstants,
    decodeEvents,
    type MultipleAbiEventsToMappedObject,
    type GasConfig,
    type TransactionReceipt,
    isTransactionReceiptSuccess,
} from '@masknet/web3-shared-evm'
import { EVMContract, EVMWeb3 } from '@masknet/web3-providers'
import { getRedPacketLatestContractWithAddress, RED_PACKET_LATEST_ABI } from './useRedPacketContract.js'
import { keccak256, type Address, type ContractFunctionArgs, type Hex } from 'viem'
import type { HappyRedPacketV4Abi } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'

export interface RedPacketSettings {
    shares: number
    duration: number
    isRandom: boolean
    total: string
    name: string
    message: string
    token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
}

export type ParamsObjType = {
    publicKey: string
    shares: number
    isRandom: boolean
    duration: number
    seed: string
    message: string
    name: string
    tokenType: number
    tokenAddress: string
    total: string
    token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
}

export function checkParams(paramsObj: ParamsObjType) {
    if (isLessThan(paramsObj.total, paramsObj.shares)) {
        throw new Error('At least [number of lucky drops] tokens to your lucky drop.')
    }

    if (paramsObj.shares <= 0) {
        throw new Error('At least 1 person should be able to claim the lucky drop.')
    }

    return true
}

type MethodParameters = ContractFunctionArgs<HappyRedPacketV4Abi, 'payable', 'create_red_packet'>
interface CreateParams {
    gas: string | undefined
    params: MethodParameters
    paramsObj: ParamsObjType
    gasError: Error | null
}

export function getCreateRedPacketParameters(paramsObj: ParamsObjType): MethodParameters {
    return [
        paramsObj.publicKey as Address,
        BigInt(paramsObj.shares),
        paramsObj.isRandom,
        BigInt(paramsObj.duration),
        paramsObj.seed as Hex,
        paramsObj.message,
        paramsObj.name,
        BigInt(paramsObj.tokenType),
        paramsObj.tokenAddress as Address,
        BigInt(toFixed(paramsObj.total)),
    ] as const
}

function useCreateParamsCallback(
    expectedChainId: ChainId,
    redPacketSettings: RedPacketSettings | undefined,
    publicKey: string,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    const getCreateParams = useCallback(async (): Promise<CreateParams | null> => {
        if (!redPacketSettings || !publicKey) return null
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings
        const seed = Math.random().toString()
        const tokenType = token!.schema === SchemaType.Native ? 0 : 1
        const tokenAddress = token!.schema === SchemaType.Native ? NATIVE_TOKEN_ADDRESS : token!.address
        if (!tokenAddress) {
            if (process.env.NODE_ENV === 'development' && !NATIVE_TOKEN_ADDRESS) {
                console.error(
                    'Not native token address for chain %s. Do you forget to configure it in token.json file?',
                    token!.chainId,
                )
            }
            return null
        }

        const paramsObj: ParamsObjType = {
            publicKey,
            shares,
            isRandom,
            duration,
            seed: keccak256(toHex(seed)),
            message,
            name,
            tokenType,
            tokenAddress,
            total,
            token,
        }

        try {
            checkParams(paramsObj)
        } catch {
            return null
        }

        const params = getCreateRedPacketParameters(paramsObj)

        let gasError: Error | null = null
        const value = toFixed(paramsObj.token?.schema === SchemaType.Native ? total : 0)

        const gas = await EVMContract.estimateContractGas(
            getRedPacketLatestContractWithAddress(chainId),
            'create_red_packet',
            params,
            {
                chainId,
                from: account,
                value,
            },
        ).catch((error: Error) => {
            gasError = error
        })

        return { gas: gas ? toFixed(gas) : undefined, params, paramsObj, gasError }
    }, [redPacketSettings, account, publicKey, chainId])

    return getCreateParams
}

export function useCreateParams(expectedChainId: ChainId, redPacketSettings: RedPacketSettings, publicKey: string) {
    const { pluginID } = useEnvironmentContext()
    const getCreateParams = useCreateParamsCallback(expectedChainId, redPacketSettings, publicKey)
    // TODO get rid of JSON.stringify
    return useAsync(async () => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return null

        return getCreateParams()
    }, [JSON.stringify(redPacketSettings), publicKey])
}

export function useCreateCallback(
    expectedChainId: ChainId,
    redPacketSettings: RedPacketSettings,
    publicKey: string,
    gasOption?: GasConfig,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const getCreateParams = useCreateParamsCallback(expectedChainId, redPacketSettings, publicKey)

    return useAsyncFn(async (): Promise<
        | {
              hash: string
              receipt: TransactionReceipt | null
              events: undefined | MultipleAbiEventsToMappedObject<RED_PACKET_LATEST_ABI>
          }
        | undefined
    > => {
        const token = redPacketSettings.token
        const createParams = await getCreateParams()
        if (!token || !createParams) return

        const { gas, params, paramsObj, gasError } = createParams
        if (gasError) return

        try {
            checkParams(paramsObj)
        } catch (error) {
            return
        }

        // estimate gas and compose transaction
        const tx = EVMContract.createTransactionRequest(
            getRedPacketLatestContractWithAddress(chainId),
            'create_red_packet',
            params,
            {
                from: account,
                value: toFixed(token.schema === SchemaType.Native ? paramsObj.total : 0),
                gas,
                chainId,
                ...gasOption,
            },
        )
        if (!tx) return

        const hash = await EVMWeb3.sendTransaction(tx, {
            paymentToken: gasOption?.gasCurrency,
            chainId,
            gasOptionType: gasOption?.gasOptionType,
        })
        const receipt = await EVMWeb3.getTransactionReceipt(hash, { chainId })
        if (receipt && isTransactionReceiptSuccess(receipt)) {
            const events = decodeEvents(RED_PACKET_LATEST_ABI, receipt.logs)

            return {
                hash,
                receipt,
                events,
            }
        }
        return { hash, receipt, events: undefined }
    }, [account, redPacketSettings.token, gasOption, chainId, getCreateParams])
}
