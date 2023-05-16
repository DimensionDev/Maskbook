import { AvatarType } from '@masknet/plugin-avatar'
import {
    searchTwitterAvatarNFTSelector,
    searchTwitterAvatarNFTStyleSelector,
    searchTwitterAvatarNormalSelector,
    searchTwitterAvatarSelector,
    searchTwitterCircleAvatarSelector,
    searchTwitterSquareAvatarSelector,
} from './selector.js'

export function getAvatarType(ele?: HTMLElement) {
    const dom =
        ele ??
        searchTwitterAvatarNFTStyleSelector().evaluate() ??
        searchTwitterAvatarNormalSelector().querySelector('div').evaluate()
    if (!dom) return AvatarType.Default
    const styles = window.getComputedStyle(dom)
    return styles.clipPath.includes('#shape-square')
        ? AvatarType.Square
        : styles.clipPath.includes('#shape-hex')
        ? AvatarType.Clip
        : AvatarType.Default
}

export function getInjectedDom() {
    const avatarType = getAvatarType()
    switch (avatarType) {
        case AvatarType.Square:
            return searchTwitterAvatarNormalSelector().evaluate()
                ? searchTwitterAvatarNormalSelector().querySelector('div img')
                : searchTwitterSquareAvatarSelector()
        case AvatarType.Default:
            return searchTwitterAvatarSelector()
        case AvatarType.Clip:
            return searchTwitterAvatarNFTSelector()
        default:
            return searchTwitterCircleAvatarSelector()
    }
}
