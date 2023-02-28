import { Twitter } from '@masknet/web3-providers'

export function getInjectNodeInfo(ele: HTMLElement) {
    const imgEle = ele.firstElementChild?.querySelector('img')
    if (!imgEle) return

    const nftDom = imgEle.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
    if (!nftDom) return

    nftDom.style.overflow = 'unset'
    const avatarParent = nftDom.parentElement
    let isTwitterNFT = false

    if (avatarParent) {
        isTwitterNFT = avatarParent.style.clipPath === 'url("#shape-hex")'
        if (process.env.NODE_ENV === 'development') {
            if (
                avatarParent.style.clipPath &&
                avatarParent.style.clipPath !== 'url("#shape-square-rx-8")' &&
                !document.getElementById('shape-hex')
            ) {
                console.error("Twitter DOM might get updated, can not find clip path by 'shape-hex'")
            }
        }
    }

    const { offsetWidth: width, offsetHeight: height } = nftDom
    const avatarId = Twitter.getAvatarId(imgEle.src)
    if (!avatarId) return

    return { element: nftDom, width, height, avatarId, isTwitterNFT }
}
