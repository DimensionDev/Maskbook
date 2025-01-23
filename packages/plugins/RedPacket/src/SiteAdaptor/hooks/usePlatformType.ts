import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { Sniffings } from '@masknet/shared-base'
import { FireflyRedPacketAPI as F } from '@masknet/web3-providers/types'

export function usePlatformType() {
    const source = usePostInfoDetails.source?.()
    if (Sniffings.is_twitter_page) return F.PlatformType.twitter
    if (!source) return
    return source === 'Lens' ? F.PlatformType.lens : F.PlatformType.farcaster
}
