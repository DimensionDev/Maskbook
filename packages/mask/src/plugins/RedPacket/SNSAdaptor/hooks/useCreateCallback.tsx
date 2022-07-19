import { useCallback } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import Web3Utils from 'web3-utils'
import { omit } from 'lodash-unified'
import { useAccount, useChainId, useWeb3Connection, useWeb3 } from '@masknet/plugin-infra/web3'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4'
import { FungibleToken, isLessThan, NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import {
    ChainId,
    encodeContractTransaction,
    SchemaType,
    useTokenConstants,
    decodeEvents,
} from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract'

export interface RedPacketSettings {
    shares: number
    duration: number
    isRandom: boolean
    total: string
    name: string
    message: string
    token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
}

type ParamsObjType = {
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

function checkParams(paramsObj: ParamsObjType) {
    if (isLessThan(paramsObj.total, paramsObj.shares)) {
        throw new Error('At least [number of lucky drops] tokens to your lucky drop.')
    }

    if (paramsObj.shares <= 0) {
        throw new Error('At least 1 person should be able to claim the lucky drop.')
    }

    return true
}

type MethodParameters = Parameters<HappyRedPacketV4['methods']['create_red_packet']>
interface CreateParams {
    gas: number | undefined
    params: MethodParameters
    paramsObj: ParamsObjType
    gasError: Error | null
}

export function useCreateParamsCallback(
    redPacketSettings: RedPacketSettings | undefined,
    version: number,
    publicKey: string,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    const redPacketContract = useRedPacketContract(chainId, version)
    const getCreateParams = useCallback(async (): Promise<CreateParams | null> => {
        if (!redPacketSettings || !redPacketContract) return null
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings
        const seed = Math.random().toString()
        const tokenType = token!.schema === SchemaType.Native ? 0 : 1
        const tokenAddress = token!.schema === SchemaType.Native ? NATIVE_TOKEN_ADDRESS : token!.address
        if (!tokenAddress) {
            return null
        }

        const paramsObj: ParamsObjType = {
            publicKey,
            shares,
            isRandom,
            duration,
            seed: Web3Utils.sha3(seed)!,
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

        const params = Object.values(omit(paramsObj, ['token'])) as MethodParameters

        let gasError: Error | null = null
        const value = toFixed(paramsObj.token?.schema === SchemaType.Native ? total : 0)

        const gas = await (redPacketContract as HappyRedPacketV4).methods
            .create_red_packet(...params)
            .estimateGas({ from: account, value })
            .catch((error: Error) => {
                gasError = error
            })

        return { gas: gas as number | undefined, params, paramsObj, gasError }
    }, [redPacketSettings, account, redPacketContract])

    return getCreateParams
}

export function useCreateParams(redPacketSettings: RedPacketSettings, version: number, publicKey: string) {
    const getCreateParams = useCreateParamsCallback(redPacketSettings, version, publicKey)
    return useAsync(() => getCreateParams(), [redPacketSettings, version, publicKey])
}

export function useCreateCallback(redPacketSettings: RedPacketSettings, version: number, publicKey: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const redPacketContract = useRedPacketContract(chainId, version)
    const getCreateParams = useCreateParamsCallback(redPacketSettings, version, publicKey)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(async () => {
        if (!web3 || !connection) return

        const { token } = redPacketSettings
        const createParams = await getCreateParams()
        if (!token || !redPacketContract || !createParams) return

        const { gas, params, paramsObj, gasError } = createParams

        if (gasError) {
            return
        }

        try {
            checkParams(paramsObj)
        } catch (error) {
            return
        }

        // estimate gas and compose transaction
        const value = toFixed(token.schema === SchemaType.Native ? paramsObj.total : 0)
        const config = {
            from: account,
            value,
            gas,
        }

        const tx = await encodeContractTransaction(
            redPacketContract,
            redPacketContract.methods.create_red_packet(...params),
            config,
        )

        const hash = await connection.sendTransaction(tx)
        const receipt = await connection.getTransactionReceipt(hash)
        if (receipt) {
            const events = decodeEvents(web3, redPacketContract.options.jsonInterface, receipt)

            return {
                hash,
                receipt,
                events,
            }
        }
        return { hash, receipt }
    }, [account, chainId, web3, connection, redPacketContract, redPacketSettings])
}
