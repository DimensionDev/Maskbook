import { useWeb3 } from '@masknet/web3-shared'
import { useAsync } from 'react-use'
import { getNFTAvatar } from '../gun'
import { usePersona } from './usePersona'

export function useNFTAvatar(userId: string) {
    const web3 = useWeb3()
    const persona = usePersona(userId)

    return useAsync(async () => {
        if (!userId) return
        if (!persona) return
        const avatar = await getNFTAvatar(persona, web3)
        return avatar
    }, [userId]).value
}
