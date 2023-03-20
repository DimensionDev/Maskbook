import { useMemo } from 'react'
import { AvatarType } from '../constant.js'
import { searchTwitterAvatarNFTStyleSelector } from './selector.js'

export function useAvatarType() {
    return useMemo(() => {
        return getAvatarType()
    }, [])
}

export function getAvatarType() {
    const dom = searchTwitterAvatarNFTStyleSelector().evaluate()
    if (!dom) return
    const styles = window.getComputedStyle(dom)
    console.log(styles.clipPath)
    return styles.clipPath.includes('#shape-square')
        ? AvatarType.AVATAR_SQUARE
        : styles.clipPath.includes('#shape-hex')
        ? AvatarType.AVATAR_CLIP
        : AvatarType.AVATAR_CIRCLE
}
