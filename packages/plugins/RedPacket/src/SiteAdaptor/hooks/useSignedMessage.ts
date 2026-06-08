import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { signMessage } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { usePlatformType } from './usePlatformType.js'
import type { Hex } from 'viem'

// TODO NFT redpacket is not supported by the API yet.
export function useSignedMessage(account: string, payload: RedPacketJSONPayload = {} as RedPacketJSONPayload) {
    const rpid = 'rpid' in payload ? payload.rpid : payload.id
    const password = 'privateKey' in payload ? payload.privateKey : payload.password
    const version = 'contract_version' in payload ? payload.contract_version : payload.contractVersion
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
