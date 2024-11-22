import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { FireflyRedPacket } from '@masknet/web3-providers'
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { signMessage } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { RedPacketRPC } from '../../messages.js'
import { usePlatformType } from './usePlatformType.js'

export function useSignedMessage(account: string, payload: RedPacketJSONPayload = {} as RedPacketJSONPayload) {
    const rpid = payload.rpid
    const password = 'privateKey' in payload ? payload.privateKey : payload.password
    const version = payload.contract_version
    const platform = usePlatformType()
    const me = useLastRecognizedIdentity()
    const profile =
        platform ?
            {
                needLensAndFarcasterHandle: true,
                platform,
                profileId: me?.profileId,
                handle: me?.identifier?.userId,
                lensToken: me?.lensToken,
                farcasterMessage: me?.farcasterMessage as HexString,
                farcasterSigner: me?.farcasterSigner as HexString,
                farcasterSignature: me?.farcasterSignature as HexString,
            }
        :   undefined

    return useQuery({
        queryKey: ['red-packet', 'signed-message', rpid, version, password, account, profile],
        queryFn: async () => {
            try {
                const record = await RedPacketRPC.getRedPacketRecord(payload.txid)
                if (record?.password) return record.password
            } catch {}
            if (version <= 3) return password as string
            if (password) return signMessage(account, password as string).signature
            if (!profile || !account) return ''
            return FireflyRedPacket.createClaimSignature({
                rpid,
                profile,
                wallet: {
                    address: account,
                },
            })
        },
    })
}
