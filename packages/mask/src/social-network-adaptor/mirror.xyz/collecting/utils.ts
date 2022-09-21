import { ProfileIdentifier } from '@masknet/shared-base'
import type { Writer } from '@masknet/web3-providers'
import urlcat from 'urlcat'
import { mirrorBase } from '../base.js'

export const getMirrorProfileUrl = (id: string) => urlcat('https://mirror.xyz/:id', { id })

export function formatWriter(writer: Writer) {
    return {
        avatar: writer.avatarURL,
        nickname: writer.displayName,
        bio: writer.description,
        homepage: writer.domain || getMirrorProfileUrl(writer.address),
        identifier: ProfileIdentifier.of(mirrorBase.networkIdentifier, writer.address).unwrapOr(undefined),
    }
}
