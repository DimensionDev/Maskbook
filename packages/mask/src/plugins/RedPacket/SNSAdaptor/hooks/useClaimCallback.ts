import { useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { encodeContractTransaction } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import Web3Utils from 'web3-utils'
import { useRedPacketContract } from './useRedPacketContract'

export function useClaimCallback(version: number, from: string, id: string, password?: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const redPacketContract = useRedPacketContract(chainId, version)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    return useAsyncFn(async () => {
        if (!connection || !redPacketContract || !id || !password) return

        const config = {
            from,
        }
        // note: despite the method params type of V1 and V2 is the same,
        // but it is more understandable to declare respectively
        const tx =
            version === 4
                ? await encodeContractTransaction(
                      redPacketContract,
                      (redPacketContract as HappyRedPacketV4).methods.claim(id, password, from),
                      config,
                  )
                : await encodeContractTransaction(
                      redPacketContract,
                      (redPacketContract as HappyRedPacketV1).methods.claim(id, password, from, Web3Utils.sha3(from)!),
                      config,
                  )

        return connection.sendTransaction(tx)
    }, [id, password, from, redPacketContract, chainId, version, connection])
}
