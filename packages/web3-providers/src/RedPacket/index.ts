import { attemptUntil } from '@masknet/web3-shared-base'
import { type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { ChainbaseRedPacketAPI } from '../Chainbase/index.js'
import { EtherscanRedPacket } from '../Etherscan/index.js'
import type { RedPacketBaseAPI } from '../entry-types.js'

class RedPacketAPI implements RedPacketBaseAPI.Provider<ChainId, SchemaType> {
    async getHistoryTransactions(
        chainId: ChainId,
        senderAddress: string,
        contractAddress: string,
        methodId: string,
        fromBlock: number,
        endBlock: number,
    ) {
        const attempts = [
            () => {
                return EtherscanRedPacket.getHistoryTransactions(
                    chainId,
                    senderAddress,
                    contractAddress,
                    methodId,
                    fromBlock,
                    endBlock,
                )
            },
        ]
        if (ChainbaseRedPacketAPI.isSupportedChain(chainId)) {
            attempts.unshift(() => {
                return ChainbaseRedPacketAPI.getHistoryTransactions(chainId, senderAddress, contractAddress, methodId)
            })
        }
        return attemptUntil(attempts, [])
    }
}
export const RedPacket = new RedPacketAPI()
