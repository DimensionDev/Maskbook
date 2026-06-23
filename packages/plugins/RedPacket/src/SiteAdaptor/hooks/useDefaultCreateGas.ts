import { useAsync } from 'react-use'
import { toHex, type NetworkPluginID } from '@masknet/shared-base'
import { ZERO, toFixed } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
import { EVMContract } from '@masknet/web3-providers'
import {
    checkParams,
    getCreateRedPacketParameters,
    type RedPacketSettings,
    type ParamsObjType,
} from './useCreateCallback.js'
import { asHappyRedPacketV4Contract, useRedPacketContract } from './useRedPacketContract.js'
import { keccak256 } from 'viem'

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
            return ZERO
        }

        const params = getCreateRedPacketParameters(paramsObj)

        const value = toFixed(paramsObj.token?.schema === SchemaType.Native ? total : 0)

        return EVMContract.estimateContractGas(
            asHappyRedPacketV4Contract(redPacketContract),
            'create_red_packet',
            params,
            {
                chainId,
                from: account,
                value,
            },
        )
    }, [
        JSON.stringify(redPacketSettings),
        account,
        chainId,
        redPacketContract,
        publicKey,
        version,
        NATIVE_TOKEN_ADDRESS,
    ])
}
