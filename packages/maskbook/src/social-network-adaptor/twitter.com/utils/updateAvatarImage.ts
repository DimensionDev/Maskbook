import { AvatarMetaDB, getNFTAvatar } from '../../../components/InjectedComponents/NFTAvatar'
import { Flags } from '../../../utils'

export function updateAvatarImage(parent: HTMLElement, image?: string) {
    if (!Flags.nft_avatar_enabled) {
        return
    }

    if (!image) {
        recovAvatar(parent)
        return
    }

    const avatar = parent?.firstChild as HTMLDivElement
    if (avatar) {
        if (!avatar.hasAttribute('avatar')) {
            avatar.setAttribute('avatar', avatar.style.backgroundImage)
        }
        avatar.style.backgroundImage = `url(${new URL(image, import.meta.url)})`
    }
    const ele = parent.lastChild as HTMLDivElement

    if (ele) {
        if (!ele.hasAttribute('avatar')) {
            ele.setAttribute('avatar', ele.getAttribute('src') ?? '')
        }
        ele.setAttribute('src', `url(${new URL(image, import.meta.url)})`)
    }
}

function recovAvatar(parent: HTMLElement) {
    const avatar = parent.firstChild as HTMLDivElement
    if (avatar) {
        if (avatar.hasAttribute('avatar')) {
            avatar.style.backgroundImage = avatar.getAttribute('avatar') ?? ''
            avatar.removeAttribute('avatar')
        }
    }

    const image = parent.lastChild as HTMLDivElement
    if (image) {
        if (image.hasAttribute('avatar')) {
            image.setAttribute('src', image.getAttribute('avatar') ?? '')
            image.removeAttribute('avatar')
        }
    }
}

export function updateAvatarFromDB(parent?: HTMLElement, twitterId?: string) {
    if (!parent || !twitterId) return
    getNFTAvatar(twitterId).then((avatarMeta: AvatarMetaDB) => {
        updateAvatarImage(parent, avatarMeta.image ?? '')
    })
}

const TWITTER_AVATAR_ID_MATCH = /^\/profile_images\/(\d+)/
function getURL(node: HTMLElement) {
    if (node.hasAttribute('avatar')) return node.getAttribute('avatar')
    return node.getAttribute('src')
}
export function getTwitterAvatarId(parent?: HTMLElement) {
    if (!parent) return ''
    const ele = parent.lastChild as HTMLDivElement
    if (!ele) return ''

    const url = getURL(ele)
    if (!url) return ''

    const _url = new URL(url)
    const match = _url.pathname.match(TWITTER_AVATAR_ID_MATCH)
    if (!match) return ''

    return match[1]
}
