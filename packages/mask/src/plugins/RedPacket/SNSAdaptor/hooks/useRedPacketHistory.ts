import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, getRedPacketConstants } from '@masknet/web3-shared-evm'
import { useWeb3Connection } from '@masknet/web3-hooks-base'
import * as history from '../utils/history.js'
import { RedPacketRPC } from '../../messages.js'

export function useRedPacketHistory(address: string, chainId: ChainId) {
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncRetry(async () => {
        if (!connection) return EMPTY_LIST
        const blockNumber = await connection.getBlockNumber()
        return getRedPacketHistory(address, chainId, blockNumber)
    }, [address, chainId, connection])
}

async function getRedPacketHistory(address: string, chainId: ChainId, endBlock: number) {
    const { HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT } = getRedPacketConstants(chainId)
    const redpacketsFromChain = await history.getRedPacketHistory(
        chainId,
        HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT,
        endBlock,
        address,
    )
    // #region Inject password from database
    return RedPacketRPC.getRedPacketHistoryFromDatabase(redpacketsFromChain)
    // #endregion
}
