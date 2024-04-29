import { getAvatarId } from './user.js'

export function getInjectNodeInfo(element: HTMLElement | SVGElement) {
    const imgEle = element.querySelector<SVGImageElement>('image')
    if (!imgEle) return

    const nftDom = imgEle.parentNode?.parentNode as HTMLElement

    const width = Number(window.getComputedStyle(nftDom).width.replace('px', '') ?? 0)
    const height = Number(window.getComputedStyle(nftDom).height.replace('px', '') ?? 0)

    const avatarId = getAvatarId(imgEle.href.baseVal)
    if (!avatarId) return

    return { element: nftDom, width, height, avatarId }
}
