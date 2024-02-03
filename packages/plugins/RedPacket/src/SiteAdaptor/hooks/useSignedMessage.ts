import { useLastRecognizedIdentity, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
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
    const password = 'password' in payload ? payload.password : payload.privateKey
    const version = 'contract_version' in payload ? payload.contract_version : payload.contractVersion
    const author = usePostInfoDetails.author()
    const platform = usePlatformType()
    const me = useLastRecognizedIdentity()
    const profile =
        platform ?
            {
                needLensAndFarcasterHandle: true,
                platform,
                profileId: author?.userId || '',
                lensToken: me?.lensToken,
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
                profile: profile,
                wallet: {
                    address: account,
                },
            })
        },
    })
}
