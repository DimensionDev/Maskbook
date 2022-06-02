import { useAsyncFn } from 'react-use'
import Web3Utils from 'web3-utils'
import { useRedPacketContract } from './useRedPacketContract'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType } from '@masknet/web3-shared-evm'
import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useClaimCallback(version: number, from: string, id: string, password?: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const redPacketContract = useRedPacketContract(chainId, version)
    return useAsyncFn(async () => {
        if (!redPacketContract || !id || !password) return

        // note: despite the method params type of V1 and V2 is the same,
        // but it is more understandable to declare respectively
        const claim =
            version === 4
                ? () => (redPacketContract as HappyRedPacketV4).methods.claim(id, password, from)
                : () =>
                      (redPacketContract as HappyRedPacketV1).methods.claim(
                          id,
                          password as string,
                          from,
                          Web3Utils.sha3(from)!,
                      )

        // estimate gas and compose transaction
        const config = {
            from,
            gas: await claim()
                .estimateGas({
                    from,
                })
                .catch((error) => {
                    throw error
                }),
        }
        // step 2-1: blocking
        return new Promise<string>((resolve, reject) => {
            claim()
                .send(config as NonPayableTx)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, reject)
        })
    }, [id, password, from, redPacketContract, chainId, version])
}
