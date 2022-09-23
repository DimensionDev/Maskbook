import type { SocialIdentity } from '@masknet/web3-shared-base'
import { Mirror } from '@masknet/web3-providers'
import { ProfileIdentifier } from '@masknet/shared-base'
import { mirrorBase } from '../base'
import urlcat from 'urlcat'

const getMirrorProfileUrl = (id: string) => urlcat('https://mirror.xyz/:id', { id })

export async function getUserIdentity(userAddress: string): Promise<SocialIdentity | undefined> {
    if (!userAddress) return
    const writer = await Mirror.getWriter(userAddress)
    if (!writer) return

    return {
        avatar: writer.avatarURL,
        nickname: writer.displayName,
        identifier: ProfileIdentifier.of(mirrorBase.networkIdentifier, writer.address).unwrapOr(undefined),
        bio: writer.description,
        homepage: writer.domain || getMirrorProfileUrl(writer.address),
    }
}
