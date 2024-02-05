import { useAsyncFn } from 'react-use'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { HappyRedPacketV1 } from '@masknet/web3-contracts/types/HappyRedPacketV1.js'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { EVMChainResolver, EVMWeb3 } from '@masknet/web3-providers'
import { ContractTransaction } from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract.js'
import { useSignedMessage } from './useSignedMessage.js'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-providers/types'

export function useClaimCallback(
    account: string,
    payload: RedPacketJSONPayload | RedPacketNftJSONPayload = {} as RedPacketJSONPayload,
) {
    const payloadChainId = payload.chainId
    const version = 'contract_version' in payload ? payload.contract_version : payload.contractVersion
    const rpid = 'rpid' in payload ? payload.rpid : payload.id
    const { chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: payloadChainId })
    const chainIdByName = EVMChainResolver.chainId('network' in payload ? payload.network! : '')
    const chainId = payloadChainId || chainIdByName || contextChainId
    const redPacketContract = useRedPacketContract(chainId, version)
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
