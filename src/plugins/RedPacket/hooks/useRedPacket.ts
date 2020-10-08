import { ValueRef } from '@holoflows/kit/es'
import Services from '../../../extension/service'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { RedPacketRecord } from '../types'
import { RedPacketArrayComparer } from '../helpers'
import { useChainId } from '../../../web3/hooks/useChainId'
import { resolveChainId } from '../../../web3/pipes'
import { useBlockNumberOnce } from '../../../web3/hooks/useBlockNumber'
import { useAsync } from 'react-use'
import { RED_PACKET_HISTROY_MAX_BLOCK_SIZE } from '../constants'

//#region tracking red packets in the DB
const redPacketsRef = new ValueRef<RedPacketRecord[]>([], RedPacketArrayComparer)
const revalidate = async () => {
    redPacketsRef.value = await Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketsFromDB')
}
revalidate()
//#endregion

export function useRedPacketFromDB(rpid: string) {
    const redPackets = useValueRef(redPacketsRef)
    return redPackets.find((x) => x.id === rpid)
}

export function useRedPacketsFromDB() {
    const chainId = useChainId()
    const redPackets = useValueRef(redPacketsRef)
    return redPackets.filter((x) => (x.payload.network ? resolveChainId(x.payload.network) === chainId : false))
}

export function useRedPacketsFromChain(from: string) {
    const chainId = useChainId()
    const blockNumber = useBlockNumberOnce()
    return useAsync(
        async () =>
            blockNumber
                ? Services.Plugin.invokePlugin(
                      'maskbook.red_packet',
                      'getRedPacketsFromChain',
                      chainId,
                      from,
                      blockNumber - RED_PACKET_HISTROY_MAX_BLOCK_SIZE,
                  )
                : [],
        [blockNumber, chainId, from],
    )
}
