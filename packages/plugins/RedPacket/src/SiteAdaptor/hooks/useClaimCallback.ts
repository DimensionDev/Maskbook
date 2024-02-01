import { useAsyncFn } from 'react-use'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1.js'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { type ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract.js'

export function useClaimCallback(
    version: number,
    from: string,
    id: string,
    signedMsg?: string,
    expectedChainId?: ChainId,
) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const redPacketContract = useRedPacketContract(chainId, version)
    return useAsyncFn(async () => {
        if (!redPacketContract || !id || !signedMsg) return

        const config = {
            from,
        }
        // note: despite the method params type of V1 and V2 is the same,
        // but it is more understandable to declare respectively
        const contractTransaction = new ContractTransaction(redPacketContract)
        const tx =
            version === 4 ?
                await contractTransaction.fillAll(
                    (redPacketContract as HappyRedPacketV4).methods.claim(id, signedMsg, from),
                    config,
                )
            :   await contractTransaction.fillAll(
                    (redPacketContract as HappyRedPacketV1).methods.claim(id, signedMsg, from, web3_utils.sha3(from)!),
                    config,
                )

        return EVMWeb3.sendTransaction(tx, {
            chainId,
        })
    }, [id, signedMsg, from, chainId, redPacketContract, version])
}
