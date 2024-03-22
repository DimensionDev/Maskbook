import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm'
import type { BaseConnectionOptions } from '@masknet/web3-providers/types'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useRedPacketContract } from './useRedPacketContract.js'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useLastRecognizedIdentity, usePostInfoDetails } from '@masknet/plugin-infra/content-script'

async function checkIfClaimed(
    imageUrl: string,
    account: string,
    platform: FireflyRedPacketAPI.PlatformType,
    profileId?: string,
) {
    const data = await FireflyRedPacket.parse({
        image: {
            imageUrl: imageUrl,
        },
        walletAddress: account,
        platform,
        profileId,
    })
    return data?.redpacket.isClaimed
}

type T = UseQueryResult
export function useAvailability(
    id: string,
    version: number,
    options?: BaseConnectionOptions<ChainId, ProviderType, Transaction>,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    })
    const redPacketContract = useRedPacketContract(chainId, version) as HappyRedPacketV4
    const images = usePostInfoDetails.postMetadataImages()
    const source = usePostInfoDetails.source()
    const me = useLastRecognizedIdentity()
    const myProfileId = me?.profileId
    return useQuery({
        queryKey: ['red-packet', 'check-availability', source, chainId, version, id, account, images[0]],
        queryFn: async () => {
            if (!id || !redPacketContract) return null
            const result = await redPacketContract.methods.check_availability(id).call({
                // check availability is ok w/o account
                from: account,
            })
            let isClaimed = result.claimed_amount !== '0'
            if (!isClaimed && images[0]) {
                const platform = source?.toLowerCase() as FireflyRedPacketAPI.PlatformType
                isClaimed = await checkIfClaimed(images[0], account, platform, myProfileId)
                return {
                    ...result,
                    isClaimed,
                }
            }
            return { ...result, isClaimed }
        },
        refetchInterval(query) {
            const { data } = query.state
            if (!data) return 30_000
            if (data.expired || !data.balance) return false
            return 30_000
        },
    })
}
