import { FireflyRedPacket } from '@masknet/web3-providers'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { signMessage } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

interface Options {
    account: string
    contractVersion: number
    password: string
    rpid: string
    profile?: FireflyRedPacketAPI.ProfileReaction
}

export function useSignedMessage({ account, password, contractVersion, rpid, profile }: Options) {
    const { data: signature } = useQuery({
        enabled: !password,
        queryKey: ['red-packet', 'signed-message', rpid, account, profile],
        queryFn: async () => {
            if (!profile) return ''
            return FireflyRedPacket.createClaimSignature(rpid, account as HexString, profile)
        },
    })
    if (contractVersion <= 3) return password
    if (password) return signMessage(account, password).signature
    return signature
}
