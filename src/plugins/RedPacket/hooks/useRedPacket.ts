import { useAsync } from 'react-use'
import { ValueRef } from '@dimensiondev/holoflows-kit/es'
import Services from '../../../extension/service'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { RedPacketRecord } from '../types'
import { RedPacketArrayComparer } from '../helpers'
import { useChainId } from '../../../web3/hooks/useChainState'
import { resolveChainId } from '../../../web3/pipes'
import { useBlockNumberOnce } from '../../../web3/hooks/useChainState'
import { RED_PACKET_HISTROY_MAX_BLOCK_SIZE } from '../constants'
import { PluginMessageCenter } from '../../PluginMessages'

//#region tracking red packets in the DB
const redPacketsRef = new ValueRef<RedPacketRecord[]>([], RedPacketArrayComparer)
const revalidate = async () => {
    redPacketsRef.value = await Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketsFromDB')
}
revalidate()
PluginMessageCenter.on('maskbook.red_packets.update', revalidate)
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
    const chainId = useChainId(from)
    const blockNumber = useBlockNumberOnce(chainId)
    return useAsync(
        async () =>
            blockNumber
                ? Services.Plugin.invokePlugin(
                      'maskbook.red_packet',
                      'getRedPacketsFromChain',
                      from,
                      blockNumber - RED_PACKET_HISTROY_MAX_BLOCK_SIZE,
                  )
                : [],
        [blockNumber, from],
    )
}
