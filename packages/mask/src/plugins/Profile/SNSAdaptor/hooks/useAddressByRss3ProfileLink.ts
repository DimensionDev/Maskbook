import { useAsync } from 'react-use'
import { PluginProfileRPC } from '../../messages'

export function useAddressByRss3ProfileLink(profileUrl: string | undefined) {
    const { value: address, loading } = useAsync(async () => {
        if (!profileUrl) return ''
        const address = await PluginProfileRPC.getAddressByRss3ProfileLink(profileUrl)
        return address
    }, [profileUrl])

    return {
        address,
        loading,
    }
}
