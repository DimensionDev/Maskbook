import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ImageType } from '../types.js'
import type { User, type ShowMeta, type EssayRSSNode } from '../types.js'
import { Punk3D, DEFAULT_SET_WORD, MASK_TWITTER, DEFAULT_PUNK_MASK_WORD, PunkIcon } from '../constants.js'
import { useUser } from './useUser.js'

export function useEssay(user: User, refresh?: number) {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { value } = useAsync(async () => {
        if (!Storage || !user.address) return null
        const storage = Storage.createRSS3Storage(user.address)
        const data = await storage.get<EssayRSSNode>('_pet')

        return data?.essay.userId === user.userId ? data.essay : null
    }, [user, refresh])

    return value
}

export function useDefaultEssay(user: User) {
    const [essayMeta, setEssayMeta] = useState<ShowMeta | undefined>(undefined)
    const profileUser = useUser()
    useEffect(() => {
        if (user?.userId || user?.userId !== '$unknown') {
            const isProfile = user.userId === profileUser.userId
            const isMASK = user.userId === MASK_TWITTER
            setEssayMeta({
                image: isMASK ? Punk3D.url : isProfile ? PunkIcon : '',
                word: isMASK ? DEFAULT_PUNK_MASK_WORD : DEFAULT_SET_WORD,
                type: isMASK ? ImageType.GLB : ImageType.NORMAL,
                contract: '',
                tokenId: '',
                chainId: undefined,
            })
        } else {
            setEssayMeta(undefined)
        }
    }, [user, profileUser])
    return essayMeta
}
