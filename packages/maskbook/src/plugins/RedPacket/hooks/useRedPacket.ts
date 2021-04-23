import { useAsync } from 'react-use'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { RedPacketRecord } from '../types'
import { RedPacketArrayComparer } from '../helpers'
import { useChainId } from '../../../web3/hooks/useChainId'
import { resolveChainId } from '../../../web3/pipes'
import { useBlockNumberOnce } from '../../../web3/hooks/useBlockNumber'
import { RED_PACKET_HISTROY_MAX_BLOCK_SIZE } from '../constants'
import { useAccount } from '../../../web3/hooks/useAccount'
import { RedPacketMessage, RedPacketRPC } from '../messages'

//#region tracking red packets in the DB
const redPacketsRef = new ValueRef<RedPacketRecord[]>([], RedPacketArrayComparer)
const revalidate = async () => {
    redPacketsRef.value = await RedPacketRPC.getRedPacketsFromDB()
}
revalidate()
RedPacketMessage.events.redPacketUpdated.on(revalidate)
//#endregion

export function useRedPacketFromDB(rpid: string) {
    return useAsync(() => RedPacketRPC.getRedPacketFromDB(rpid), [rpid]).value
}

export function useRedPacketsFromDB() {
    const chainId = useChainId()
    const redPackets = useValueRef(redPacketsRef)
    return redPackets.filter((x) => (x.payload.network ? resolveChainId(x.payload.network) === chainId : false))
}

export function useRedPacketsFromChain() {
    const account = useAccount()
    const chainId = useChainId()
    const blockNumber = useBlockNumberOnce(chainId)
    return useAsync(
        async () =>
            blockNumber
                ? RedPacketRPC.getRedPacketsFromChain(account, blockNumber - RED_PACKET_HISTROY_MAX_BLOCK_SIZE)
                : [],
        [account, blockNumber],
    )
}
