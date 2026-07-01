import { toHex, type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMChainResolver, EVMContract, EVMWeb3 } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import type { ChainId, ContractWithAddress } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useRedPacketContract, type RedPacketContractAnyVersion } from './useRedPacketContract.js'
import { useSignedMessage } from './useSignedMessage.js'
import { keccak256, type Address, type Hex } from 'viem'
import type { HappyRedPacketV4Abi } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'

/**
 * Claim fungible token red packet.
 */
export function useClaimCallback(account: string, payload: RedPacketJSONPayload = {} as RedPacketJSONPayload) {
    const payloadChainId = payload.token?.chainId as ChainId
    const version = payload.contract_version
    const rpid = payload.rpid
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: payloadChainId,
    })
    const chainIdByName = EVMChainResolver.chainId('network' in payload ? payload.network! : '')
    const chainId = payloadChainId || chainIdByName || contextChainId
    const redPacketContract = useRedPacketContract(chainId as ChainId, version)
    const { refetch } = useSignedMessage(account, payload)
    return useAsyncFn(async () => {
        if (!redPacketContract || !rpid) return
        const { data: signedMsg } = await refetch()
        if (!signedMsg) return
        const config = {
            from: account,
        }

        const tx =
            version === 4 ?
                EVMContract.createTransactionRequest(
                    redPacketContract as ContractWithAddress<HappyRedPacketV4Abi>,
                    'claim',
                    [rpid as Hex, signedMsg as Hex, account as Address],
                    config,
                )
            :   EVMContract.createTransactionRequest(
                    redPacketContract as ContractWithAddress<Exclude<RedPacketContractAnyVersion, HappyRedPacketV4Abi>>,
                    'claim',
                    [rpid as Hex, signedMsg, account as Address, keccak256(toHex(account))],
                    config,
                )
        if (!tx) return
        const gas =
            version === 4 ?
                await EVMContract.estimateContractGas(
                    redPacketContract as ContractWithAddress<HappyRedPacketV4Abi>,
                    'claim',
                    [rpid as Hex, signedMsg as Hex, account as Address],
                    { chainId, ...config },
                )
            :   await EVMContract.estimateContractGas(
                    redPacketContract as ContractWithAddress<Exclude<RedPacketContractAnyVersion, HappyRedPacketV4Abi>>,
                    'claim',
                    [rpid as Hex, signedMsg, account as Address, keccak256(toHex(account))],
                    { chainId, ...config },
                )
        tx.gas ??= gas ? String(gas) : undefined

        return EVMWeb3.sendTransaction(tx, {
            chainId,
        })
    }, [rpid, account, chainId, redPacketContract, version, refetch])
}
