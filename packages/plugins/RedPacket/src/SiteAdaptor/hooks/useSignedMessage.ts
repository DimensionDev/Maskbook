import { FireflyRedPacket } from '@masknet/web3-providers'
import { signMessage } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { usePlatformType } from './usePlatformType.js'
import { RedPacketRPC } from '../../messages.js'
import { useLastRecognizedIdentity, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-providers/types'

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
    const profile = platform ? { platform, profileId: author?.userId || '', lensToken: me?.lensToken } : undefined

    const { data: storedPassword, isFetching: gettingStoredPassword } = useQuery({
        enabled: !password,
        queryKey: ['red-packet', 'password', payload.txid],
        queryFn: async () => {
            const record = await RedPacketRPC.getRedPacketRecord(payload.txid)
            return record?.password
        },
    })

    const { data: signature } = useQuery({
        enabled: !password && !gettingStoredPassword,
        queryKey: ['red-packet', 'signed-message', rpid, account, profile],
        queryFn: async () => {
            if (!profile) return ''
            return FireflyRedPacket.createClaimSignature(rpid, account as HexString, profile)
        },
    })

    if (storedPassword) return storedPassword
    if (version <= 3) return password
    if (password) return signMessage(account, password).signature
    return signature
}
