import { AvatarType } from '@masknet/plugin-avatar'
import { searchTwitterAvatarNFTStyleSelector, searchTwitterAvatarNormalSelector } from './selector.js'

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

export function isVerifiedUser(ele: HTMLElement) {
    return !!ele.closest('[data-testid="tweet"]')?.querySelector('[data-testid="icon-verified"]')
}
