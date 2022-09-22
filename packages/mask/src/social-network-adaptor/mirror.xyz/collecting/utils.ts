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

export enum MirrorPageType {
    Profile = 'profile',
    Collection = 'collection',
    Post = 'post',
    Dashboard = 'dashboard',
}

const ADDRESS_FULL = /0x\w{40,}/i
const MIRROR_SUB_DOMAIN = /https(.*)mirror.xyz/i
const MIRROR_ENTRY_ID = /\w{43}/i

export function mirrorPageProbe(url?: string) {
    if (!url) return

    if (url.includes(`/${MirrorPageType.Dashboard}`)) return MirrorPageType.Dashboard
    if (url.includes(`/${MirrorPageType.Collection}`)) return MirrorPageType.Collection

    const urlSplits = url.split('/').filter(Boolean)

    if (MIRROR_ENTRY_ID.test((urlSplits[urlSplits.length - 1] ?? '').trim())) return MirrorPageType.Post

    return MirrorPageType.Profile
}
