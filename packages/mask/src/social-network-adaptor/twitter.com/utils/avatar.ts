import { getAvatarId } from './user'

const ClipPath = 'url("#hex-hw-shapeClip-clipConfig")'

export function getInjectNodeInfo(ele: HTMLElement) {
    const imgEle = (ele.firstChild as HTMLElement).querySelector('img')
    if (!imgEle) return

    const nftDom = imgEle.parentNode?.parentNode?.parentNode?.parentNode?.parentNode as HTMLElement
    if (!nftDom) return

    nftDom.style.overflow = 'unset'
    const avatarParent = nftDom.parentElement
    let isTwitterNFT = false
    if (avatarParent) {
        const style = window.getComputedStyle(avatarParent)
        isTwitterNFT = style.clipPath === ClipPath
    }

    const width = Number(window.getComputedStyle(nftDom).width.replace('px', '') ?? 0)
    const height = Number(window.getComputedStyle(nftDom).height.replace('px', '') ?? 0)

    const dom = imgEle.parentNode?.firstChild as HTMLElement
    if (dom) dom.style.borderRadius = '100%'
    const avatarId = getAvatarId((imgEle as HTMLImageElement).src)
    if (!avatarId) return

    return { element: nftDom, width, height, avatarId, isTwitterNFT }
}
