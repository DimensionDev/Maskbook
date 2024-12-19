import { FireflyRedPacket } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useRedPacketThemes() {
    return useQuery({
        queryKey: ['redpacket', 'themes'],
        queryFn: () => FireflyRedPacket.getThemes(),
    })
}
