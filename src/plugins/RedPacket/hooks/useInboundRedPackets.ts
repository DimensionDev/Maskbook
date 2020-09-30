import { useChainId } from '../../../web3/hooks/useChainId'
import { resolveChainName } from '../../../web3/pipes'
import { useRedpackets } from './useRedPackets'
import { isSameAddress } from '../../../web3/helpers'

export function useInboundRedPackets(from: string) {
    const chainId = useChainId()
    const redPackets = useRedpackets()
    return redPackets.map(
        (x) => isSameAddress(x.sender.address, from) && x.network === resolveChainName(chainId).toLowerCase(),
    )
}
