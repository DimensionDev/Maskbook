import { useLastRecognizedIdentity, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

/**
 * Parse RedPacket with post info.
 * Firefly only.
 */
export function useParseRedPacket(chainId: ChainId) {
    const images = usePostInfoDetails.postMetadataImages()
    const { pluginID } = useNetworkContext()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })
    const source = usePostInfoDetails.source()
    const me = useLastRecognizedIdentity()
    const myProfileId = me?.profileId
    const site = usePostInfoDetails.site()
    const isOnFirefly = site === EnhanceableSite.Firefly

    const query = useQuery({
        enabled: images.length > 0 && isOnFirefly,
        queryKey: ['red-packet', 'parse', source, images[0], account],
        queryFn: async () => {
            const platform = source?.toLowerCase() as FireflyRedPacketAPI.PlatformType
            return FireflyRedPacket.parse({
                image: {
                    imageUrl: images[0],
                },
                walletAddress: account,
                platform,
                profileId: myProfileId,
            })
        },
    })
    return query.data
}
