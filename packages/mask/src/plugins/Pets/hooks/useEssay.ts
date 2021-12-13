import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { PluginPetRPC } from '../messages'
import type { User, FilterContract } from '../types'
import { DEFAULT_WORD } from '../constants'

export function useEssay(user: User, refresh?: boolean) {
    return useAsync(async () => {
        const essayMeta = await PluginPetRPC.getEssay(user.address)
        return essayMeta
    }, [user, refresh]).value
}

export function useDefaultEssay(nfts: FilterContract[]) {
    const [essayMeta, setEssayMeta] = useState<{ image: string; word: string } | undefined>(undefined)
    useEffect(() => {
        const filter = nfts.filter((y) => y.tokens.length > 0)
        if (filter.length) {
            setEssayMeta({ image: filter[0].tokens[0]?.mediaUrl ?? '', word: DEFAULT_WORD })
        }
    }, [nfts])
    return essayMeta
}
