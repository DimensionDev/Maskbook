import { usePostInfoDetails, type PostContextAuthor } from '@masknet/plugin-infra/content-script'
import { FireflyRedPacketAPI as F } from '@masknet/web3-providers/types'

const map: Record<NonNullable<PostContextAuthor['source']>, F.PlatformType> = {
    Lens: F.PlatformType.lens,
    Farcaster: F.PlatformType.farcaster,
    Twitter: F.PlatformType.twitter,
}

export function usePlatformType() {
    const source = usePostInfoDetails.source?.()
    if (!source) return ''
    return map[source]
}
