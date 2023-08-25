import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { Web3Storage } from '@masknet/web3-providers'
import { ImageType } from '../types.js'
import type { User, ShowMeta, EssayRSSNode } from '../types.js'
import { MASK_TWITTER, PunkIcon, Punk3D } from '../constants.js'
import { useUser } from './useUser.js'
import { useI18N } from '../locales/i18n_generated.js'

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
    const t = useI18N()
    const essayMeta = useMemo<ShowMeta | undefined>(() => {
        if (user?.userId || user?.userId !== '$unknown') {
            const isProfile = user.userId === profileUser?.userId
            const isMASK = user.userId === MASK_TWITTER
            return {
                image: isMASK ? Punk3D.url : isProfile ? PunkIcon : '',
                word: t.pet_setting_tooltip({ context: isMASK ? 'punk' : 'default' }),
                type: ImageType.NORMAL,
                contract: '',
                tokenId: '',
                chainId: undefined,
            }
        } else {
            return
        }
    }, [user, profileUser, t])
    return essayMeta
}
