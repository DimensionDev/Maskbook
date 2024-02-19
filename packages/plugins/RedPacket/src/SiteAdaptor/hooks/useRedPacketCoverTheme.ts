import { FireflyRedPacket } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useCoverTheme(rpid: string) {
    const { data } = useQuery({
        enabled: !!rpid,
        queryKey: ['red-packet', 'theme-id', rpid],
        queryFn: async () => {
            return FireflyRedPacket.getThemeByRpid(rpid)
        },
    })
    return data
}
