import { AvatarMetaDB, getNFTAvatar } from '../../../components/InjectedComponents/NFTAvatar'
import { Flags } from '../../../utils'

export function updateAvatarImage(parent: HTMLElement, image?: string) {
    if (!Flags.nft_avatar_enabled) {
        return
    }

    return
    /*
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
    */
}

function recoveAvatar(parent: HTMLElement) {
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
