import { useCallback } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { omit } from 'lodash-es'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useEnvironmentContext } from '@masknet/web3-hooks-base'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { type FungibleToken, isLessThan, toFixed } from '@masknet/web3-shared-base'
import {
    type ChainId,
    SchemaType,
    useTokenConstants,
    decodeEvents,
    ContractTransaction,
    type GasConfig,
} from '@masknet/web3-shared-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useRedPacketContract } from './useRedPacketContract.js'

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

export type MethodParameters = Parameters<HappyRedPacketV4['methods']['create_red_packet']>
interface CreateParams {
    gas: string | undefined
    params: MethodParameters
    paramsObj: ParamsObjType
    gasError: Error | null
}

function useCreateParamsCallback(
    expectedChainId: ChainId,
    redPacketSettings: RedPacketSettings | undefined,
    version: number,
    publicKey: string,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    const redPacketContract = useRedPacketContract(chainId, version)
    const getCreateParams = useCallback(async (): Promise<CreateParams | null> => {
        if (!redPacketSettings || !redPacketContract || !publicKey) return null
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
            seed: web3_utils.sha3(seed)!,
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

        return { gas: gas ? toFixed(gas) : undefined, params, paramsObj, gasError }
    }, [redPacketSettings, account, redPacketContract, publicKey])

    return getCreateParams
}

export function useCreateParams(
    expectedChainId: ChainId,
    redPacketSettings: RedPacketSettings,
    version: number,
    publicKey: string,
) {
    const { pluginID } = useEnvironmentContext()
    const getCreateParams = useCreateParamsCallback(expectedChainId, redPacketSettings, version, publicKey)
    // TODO get rid of JSON.stringify
    return useAsync(async () => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return null

        return getCreateParams()
    }, [JSON.stringify(redPacketSettings), version, publicKey])
}

export function useCreateCallback(
    expectedChainId: ChainId,
    redPacketSettings: RedPacketSettings,
    version: number,
    publicKey: string,
    gasOption?: GasConfig,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const redPacketContract = useRedPacketContract(chainId, version)
    const getCreateParams = useCreateParamsCallback(expectedChainId, redPacketSettings, version, publicKey)

    return useAsyncFn(async () => {
        const token = redPacketSettings.token
        const createParams = await getCreateParams()
        if (!token || !redPacketContract || !createParams) return

        const { gas, params, paramsObj, gasError } = createParams
        if (gasError) return

        try {
            checkParams(paramsObj)
        } catch (error) {
            return
        }

        // estimate gas and compose transaction
        const tx = await new ContractTransaction(redPacketContract).fillAll(
            redPacketContract.methods.create_red_packet(...params),
            {
                from: account,
                value: toFixed(token.schema === SchemaType.Native ? paramsObj.total : 0),
                gas,
                chainId,
                ...gasOption,
            },
        )

        const hash = await EVMWeb3.sendTransaction(tx, {
            paymentToken: gasOption?.gasCurrency,
            chainId,
            gasOptionType: gasOption?.gasOptionType,
        })
        const receipt = await EVMWeb3.getTransactionReceipt(hash, { chainId })
        if (receipt) {
            const events = decodeEvents(redPacketContract.options.jsonInterface, receipt.logs)

            return {
                hash,
                receipt,
                events,
            }
        }
        return { hash, receipt }
    }, [account, redPacketContract, redPacketSettings.token, gasOption, chainId, getCreateParams])
}
