import {
    useLastRecognizedIdentity,
    usePostInfoMentionedLinks,
    usePostInfoPostMetadataImages,
} from '@masknet/plugin-infra/content-script'
import { useChainContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'

/**
 * Parse RedPacket with post info.
 * Can parse both EVM and Solana RedPacket
 */
export function useParseRedPacket() {
    const images = usePostInfoPostMetadataImages()
    const links = usePostInfoMentionedLinks()
    const { account } = useChainContext()
    const me = useLastRecognizedIdentity()
    const myProfileId = me?.profileId
    const linksWithPayload = links.filter((x) => /\bPostData_v\d=/.test(x))

    return useQuery({
        enabled: images.length > 0 || linksWithPayload.length > 0,
        queryKey: ['red-packet', 'parse', images[0], linksWithPayload, account, myProfileId],
        queryFn: async () => {
            return FireflyRedPacket.parse({
                text: linksWithPayload.join('\n'),
                image:
                    linksWithPayload.length ? undefined : (
                        {
                            imageUrl: images[0],
                        }
                    ),
                walletAddress: account,
                platform: FireflyRedPacketAPI.PlatformType.twitter,
                profileId: myProfileId,
            })
        },
    })
}
