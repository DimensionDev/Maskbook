import { AvatarType } from '../constant.js'
import { searchTwitterAvatarNFTStyleSelector } from './selector.js'

export function getAvatarType(ele?: HTMLElement) {
    const dom = ele ?? searchTwitterAvatarNFTStyleSelector().evaluate()
    if (!dom) return AvatarType.Default
    const styles = window.getComputedStyle(dom)
    return styles.clipPath.includes('#shape-square')
        ? AvatarType.Square
        : styles.clipPath.includes('#shape-hex')
        ? AvatarType.Clip
        : AvatarType.Circle
}
