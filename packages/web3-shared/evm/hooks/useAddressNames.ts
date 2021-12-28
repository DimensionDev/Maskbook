import { useAsyncRetry } from 'react-use'
import { useWeb3Context } from '../context'

export function useAddressNames(identity: {
    identifier: {
        userId: string
        network: string
    }
    avatar?: string
    bio?: string
    nickname?: string
    homepage?: string
}) {
    const { getAddressNamesList } = useWeb3Context()

    return useAsyncRetry(async () => {
        return getAddressNamesList(identity)
    }, [identity, getAddressNamesList])
}
