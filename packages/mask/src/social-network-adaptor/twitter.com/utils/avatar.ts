import { Twitter } from '@masknet/web3-providers'

// cspell:disable-next
const ClipPath = 'url("#hex-hw-shapeclip-clipconfig")'

export function getInjectNodeInfo(ele: HTMLElement) {
    const imgEle = ele.querySelector('img')
    if (!imgEle) return

    const nftDom = imgEle.closest<HTMLElement>('a[href][role=link]')
    if (!nftDom) return

    nftDom.style.overflow = 'unset'
    const avatarParent = nftDom.parentElement
    let isTwitterNFT = false

    if (avatarParent) {
        isTwitterNFT = avatarParent.style.clipPath === 'url("#shape-hex")'
        if (process.env.NODE_ENV === 'development') {
            if (
                avatarParent.style.clipPath &&
                avatarParent.style.clipPath === 'url("#shape-square-rx-8")' &&
                !document.getElementById('shape-hex')
            ) {
                console.error('Twitter DOM might get updated, can not find clip path by "shape-hex"')
            }
        }
    }

    const { offsetWidth: width, offsetHeight: height } = nftDom
    const avatarId = Twitter.getAvatarId(imgEle.src)
    if (!avatarId) return

    return { element: nftDom, width, height, avatarId, isTwitterNFT }
}
