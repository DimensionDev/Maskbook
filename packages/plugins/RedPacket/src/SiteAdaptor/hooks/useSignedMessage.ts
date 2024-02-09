import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { FireflyRedPacket } from '@masknet/web3-providers'
import { type RedPacketJSONPayload, type RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { signMessage } from '@masknet/web3-shared-evm'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { RedPacketRPC } from '../../messages.js'
import { usePlatformType } from './usePlatformType.js'

type T = UseQueryResult
export function useSignedMessage(
    account: string,
    payload: RedPacketJSONPayload | RedPacketNftJSONPayload = {} as RedPacketJSONPayload,
) {
    const rpid = 'rpid' in payload ? payload.rpid : payload.id
    const password = 'privateKey' in payload ? payload.privateKey : payload.password
    const version = 'contract_version' in payload ? payload.contract_version : payload.contractVersion
    const platform = usePlatformType()
    const me = useLastRecognizedIdentity()
    const profile =
        platform ?
            {
                needLensAndFarcasterHandle: true,
                platform,
                profileId: me?.profileId,
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
            if (version <= 3) return password
            if (password) return signMessage(account, password).signature
            if (!profile) return ''
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
