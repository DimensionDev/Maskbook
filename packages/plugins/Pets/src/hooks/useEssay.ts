import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { Web3Storage } from '@masknet/web3-providers'
import { ImageType } from '../types.js'
import type { User, ShowMeta, EssayRSSNode } from '../types.js'
import { DEFAULT_SET_WORD, MASK_TWITTER, DEFAULT_PUNK_MASK_WORD, PunkIcon, Punk3D } from '../constants.js'
import { useUser } from './useUser.js'

export function useEssay(user: User, refresh?: number) {
    const { value } = useAsync(async () => {
        if (!user.address) return null
        const stringStorage = Web3Storage.createFireflyStorage('Pets', user.address)
        let result: EssayRSSNode | undefined = await stringStorage.get<EssayRSSNode>('pet')
        if (!result?.essay || result.essay.userId !== user.userId) {
            const rss3Storage = Web3Storage.createRSS3Storage(user.address)
            result = await rss3Storage.get<EssayRSSNode>('_pet')
        }
        return result?.essay.userId === user.userId ? result.essay : null
    }, [user, refresh])

    return value
}

export function useDefaultEssay(user: User) {
    const profileUser = useUser()
    const essayMeta = useMemo<ShowMeta | undefined>(() => {
        if (user?.userId || user?.userId !== '$unknown') {
            const isProfile = user.userId === profileUser?.userId
            const isMASK = user.userId === MASK_TWITTER
            return {
                image: isMASK ? Punk3D.url : isProfile ? PunkIcon : '',
                word: isMASK ? DEFAULT_PUNK_MASK_WORD : DEFAULT_SET_WORD,
                type: ImageType.NORMAL,
                contract: '',
                tokenId: '',
                chainId: undefined,
            }
        } else {
            return
        }
    }, [user, profileUser])
    return essayMeta
}
