import type { NetworkPluginID } from '@masknet/shared-base'
import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1.js'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMChainResolver, EVMWeb3 } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { type ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { useRedPacketContract } from './useRedPacketContract.js'
import { useSignedMessage } from './useSignedMessage.js'

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
        // note: despite the method params type of V1 and V2 is the same,
        // but it is more understandable to declare respectively
        const contractTransaction = new ContractTransaction(redPacketContract)
        const tx =
            version === 4 ?
                await contractTransaction.fillAll(
                    (redPacketContract as HappyRedPacketV4).methods.claim(rpid, signedMsg, account),
                    config,
                )
            :   await contractTransaction.fillAll(
                    (redPacketContract as HappyRedPacketV1).methods.claim(
                        rpid,
                        signedMsg,
                        account,
                        web3_utils.sha3(account)!,
                    ),
                    config,
                )

        return EVMWeb3.sendTransaction(tx, {
            chainId,
        })
    }, [rpid, account, chainId, redPacketContract, version, refetch])
}
