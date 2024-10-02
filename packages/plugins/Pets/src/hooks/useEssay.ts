import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { Web3Storage } from '@masknet/web3-providers'
import { ImageType } from '../types.js'
import type { User, ShowMeta, EssayRSSNode } from '../types.js'
import { MASK_TWITTER, PunkIcon, Punk3D } from '../constants.js'
import { useUser } from './useUser.js'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/macro'

export function useEssay(user: User) {
    return useAsyncRetry(async () => {
        if (!user.address) return null
        const stringStorage = Web3Storage.createFireflyStorage('Pets', user.address)
        let result: EssayRSSNode | undefined = await stringStorage.get<EssayRSSNode>('pet')
        if (!result?.essay || result.essay.userId !== user.userId) {
            const rss3Storage = Web3Storage.createRSS3Storage(user.address)
            result = await rss3Storage.get<EssayRSSNode>('_pet')
        }
        return result?.essay.userId === user.userId ? result.essay : null
    }, [user.userId, user.address])
}

export function useDefaultEssay(user: User): ShowMeta | undefined {
    const profileUser = useUser()
    const { _ } = useLingui()
    const essayMeta = useMemo<ShowMeta | undefined>(() => {
        if (user?.userId || user?.userId !== '$unknown') {
            const isProfile = user.userId === profileUser?.userId
            const isMASK = user.userId === MASK_TWITTER
            return {
                image:
                    isMASK ? Punk3D.url
                    : isProfile ? PunkIcon
                    : '',
                word:
                    isMASK ?
                        _(msg`I'm CryptoPunk #6128! Voyagers, welcome to the uncharted waters of WEB3!`)
                    :   _(
                            msg`Click the Mask icon in the sidebar and access the Non-F Friends app to configure your personalized desktop NFT pet.`,
                        ),
                type: ImageType.NORMAL,
                contract: '',
                tokenId: '',
                chainId: undefined,
            }
        } else {
            return
        }
    }, [user, profileUser, _])
    return essayMeta
}
