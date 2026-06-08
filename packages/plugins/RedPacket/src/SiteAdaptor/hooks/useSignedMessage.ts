import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { signMessage } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { usePlatformType } from './usePlatformType.js'
import type { Hex } from 'viem'

export function useSignedMessage(account: string, payload: RedPacketJSONPayload = {} as RedPacketJSONPayload) {
    const rpid = payload.rpid
    const password = 'privateKey' in payload ? (payload.privateKey as string) : payload.password
    const version = payload.contract_version
    const isTokenRedPacket = 'contract_version' in payload
    const platform = usePlatformType()
    const me = useLastRecognizedIdentity()
    const profile =
        platform && me?.profileId ?
            {
                needLensAndFarcasterHandle: true,
                platform,
                profileId: me.profileId,
                handle: me.identifier?.userId,
                lensToken: me.lensToken,
                farcasterMessage: me.farcasterMessage as HexString,
                farcasterSigner: me.farcasterSigner as HexString,
                farcasterSignature: me.farcasterSignature as HexString,
            }
        :   undefined

    return useQuery({
        queryKey: ['red-packet', 'signed-message', rpid, version, password, account, profile, isTokenRedPacket],
        queryFn: async () => {
            if (isTokenRedPacket && version <= 3) return password ?? null
            if (password) return signMessage(account, password as Hex)
            if (!profile) return ''
            return (
                (await FireflyRedPacket.createClaimSignature({
                    rpid,
                    profile,
                    wallet: {
                        address: account,
                    },
                })) || null
            )
        },
    })
}
