import { useAsync } from 'react-use'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { omit } from 'lodash-es'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ZERO, toFixed } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
import { checkParams, type RedPacketSettings, type ParamsObjType, type MethodParameters } from './useCreateCallback.js'
import { useRedPacketContract } from './useRedPacketContract.js'

export function useDefaultCreateGas(
    redPacketSettings: RedPacketSettings | undefined,
    version: number,
    publicKey: string,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    const redPacketContract = useRedPacketContract(chainId, version)

    return useAsync(async () => {
        if (!redPacketSettings || !redPacketContract) return ZERO
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings
        if (!token) return ZERO
        const seed = Math.random().toString()
        const tokenType = token!.schema === SchemaType.Native ? 0 : 1
        const tokenAddress = token!.schema === SchemaType.Native ? NATIVE_TOKEN_ADDRESS : token!.address
        if (!tokenAddress) {
            return ZERO
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
            return ZERO
        }

        const params = Object.values(omit(paramsObj, ['token'])) as MethodParameters

        const value = toFixed(paramsObj.token?.schema === SchemaType.Native ? total : 0)

        return (redPacketContract as HappyRedPacketV4).methods
            .create_red_packet(...params)
            .estimateGas({ from: account, value })
    }, [JSON.stringify(redPacketSettings), account, redPacketContract, publicKey, version, NATIVE_TOKEN_ADDRESS])
}
