import { getAvatarId } from './user'
import { isMobileFacebook } from './isMobile'

export function getInjectNodeInfo(element: HTMLElement | SVGElement) {
    if (!isMobileFacebook) {
        const imgEle = element.querySelector<SVGImageElement>('image')
        if (!imgEle) return

        const nftDom = imgEle.parentNode?.parentNode as HTMLElement

        const width = Number(window.getComputedStyle(nftDom).width.replace('px', '') ?? 0)
        const height = Number(window.getComputedStyle(nftDom).height.replace('px', '') ?? 0)

        const avatarId = getAvatarId(imgEle.href.baseVal)

        if (!avatarId) return

        return { element: nftDom, width, height, avatarId }
    }

    const imgEle = element.querySelector('i')

    if (!imgEle) return

    const nftDom = imgEle.parentNode?.parentNode as HTMLElement

    const containerDom = imgEle.parentNode as HTMLElement

    const width = Number(window.getComputedStyle(nftDom).width.replace('px', '') ?? 0)
    const height = Number(window.getComputedStyle(nftDom).height.replace('px', '') ?? 0)

    const avatarId = getAvatarId(imgEle.style.background.match(/\(["']?(.*?)["']?\)/)?.[1] ?? '')

    if (!avatarId) return

    return { element: containerDom, width, height, avatarId }
}
