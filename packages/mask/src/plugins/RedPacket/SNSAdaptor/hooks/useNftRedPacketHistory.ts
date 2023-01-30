import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, getNftRedPacketConstants } from '@masknet/web3-shared-evm'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import * as history from '../utils/history.js'
import { RedPacketRPC } from '../../messages.js'

export function useNftRedPacketHistory(address: string, chainId: ChainId) {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncRetry(async () => {
        if (!connection) return EMPTY_LIST
        const blockNumber = await connection.getBlockNumber()
        return getNftRedPacketHistory(address, chainId, blockNumber)
    }, [address, chainId, connection])
}

async function getNftRedPacketHistory(address: string, chainId: ChainId, endBlock: number) {
    const { NFT_RED_PACKET_ADDRESS_BLOCK_HEIGHT } = getNftRedPacketConstants(chainId)
    const redpacketsFromChain = await history.getNFTRedPacketHistory(
        chainId,
        NFT_RED_PACKET_ADDRESS_BLOCK_HEIGHT,
        endBlock,
        address,
    )
    // #region Inject password from database
    return RedPacketRPC.getNftRedPacketHistory(redpacketsFromChain)
    // #endregion
}
