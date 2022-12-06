import { useAsyncFn } from 'react-use'
import Web3Utils from 'web3-utils'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1.js'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract.js'

export function useClaimCallback(version: number, from: string, id: string, password?: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const redPacketContract = useRedPacketContract(chainId, version)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    return useAsyncFn(async () => {
        if (!connection || !redPacketContract || !id || !password) return

        const config = {
            from,
        }
        // note: despite the method params type of V1 and V2 is the same,
        // but it is more understandable to declare respectively
        const contractTransaction = new ContractTransaction(redPacketContract)
        const tx =
            version === 4
                ? await contractTransaction.fillAll(
                      (redPacketContract as HappyRedPacketV4).methods.claim(id, password, from),
                      config,
                  )
                : await contractTransaction.fillAll(
                      (redPacketContract as HappyRedPacketV1).methods.claim(id, password, from, Web3Utils.sha3(from)!),
                      config,
                  )

        return connection.sendTransaction(tx)
    }, [id, password, from, redPacketContract, chainId, version, connection])
}
