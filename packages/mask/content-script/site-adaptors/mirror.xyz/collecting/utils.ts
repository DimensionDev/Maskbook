import { last } from 'lodash-es'
import urlcat from 'urlcat'
import { ProfileIdentifier } from '@masknet/shared-base'
import type { Writer } from '@masknet/web3-providers/types'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { mirrorBase } from '../base.js'

export function getMirrorProfileUrl(id: string) {
    return urlcat('https://mirror.xyz/:id', { id })
}

export function formatWriter(writer: Writer, isOwner: boolean) {
    return {
        avatar: writer.avatarURL,
        nickname: writer.displayName,
        bio: writer.description,
        homepage: writer.domain || getMirrorProfileUrl(writer.address),
        identifier: ProfileIdentifier.of(mirrorBase.networkIdentifier, formatEthereumAddress(writer.address)).unwrapOr(
            undefined,
        ),
        isOwner,
    }
}

export enum MirrorPageType {
    Profile = 'profile',
    Collection = 'collection',
    Post = 'post',
    Dashboard = 'dashboard',
}

export const MIRROR_ENTRY_ID = /[\w|-]{43}/i

export function getMirrorPageType(url?: string) {
    if (!url) return

    if (url.includes(`/${MirrorPageType.Dashboard}`)) return MirrorPageType.Dashboard
    if (url.includes(`/${MirrorPageType.Collection}`)) return MirrorPageType.Collection

    const urlSplits = url.split('/').filter(Boolean)

    if (MIRROR_ENTRY_ID.test((urlSplits.at(-1) ?? '').trim())) return MirrorPageType.Post

    return MirrorPageType.Profile
}

export function getMirrorUserId(href?: string) {
    if (!href) return null

    const urlObj = new URL(href)
    const url = urlObj.href.replace(urlObj.search, '').replace(/\/$/, '')

    const pageType = getMirrorPageType(url)

    // If dashboard, get from local storage
    // This localStorage usage is Okay because it is accessing website's localStorage
    // eslint-disable-next-line no-restricted-globals
    if (pageType === MirrorPageType.Dashboard) return localStorage.getItem('mirror.userAddress')

    let tempURL = url
    if (pageType === MirrorPageType.Collection) {
        tempURL = url.replace(/\/collection(.*)/, '')
    }
    if (pageType === MirrorPageType.Post) {
        tempURL = url.replace(/\/[\w|-]{43}/i, '')
    }

    const ens = last(tempURL.match(/https:\/\/mirror.xyz\/(.*)/))
    if (ens) return ens
    const match = last(tempURL.match(/https:\/\/(.*)\.mirror\.xyz/))

    return match ? `${match}.eth` : match
}
