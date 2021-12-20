import { useAsync } from 'react-use'
import { RSS3_PROFILE_URL_RE, RSS3_RNS_RE } from '../../constants'
import { PluginProfileRPC } from '../../messages'

export function useAddressByRss3(profileUrl: string, nickname: string) {
    const { value: address, loading } = useAsync(async () => {
        let rss3id: string
        let matched = nickname.match(RSS3_RNS_RE)
        if (matched) {
            rss3id = matched[1]
        } else {
            matched = profileUrl.match(RSS3_PROFILE_URL_RE)
            rss3id = matched ? matched[1] : ''
        }
        if (!rss3id) return ''
        const address = await PluginProfileRPC.getAddressByRss3Id(rss3id)
        return address
    }, [profileUrl])

    return {
        address,
        loading,
    }
}
