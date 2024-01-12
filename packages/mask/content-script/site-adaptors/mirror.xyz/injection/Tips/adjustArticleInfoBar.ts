import { getAuthorWallet } from '../../utils/user.js'

function selector() {
    const authorWallet = getAuthorWallet()
    return `#__next div:has(> div > a[href$="mirror.xyz/${authorWallet}" i] button[data-state] img[alt^="0x" i]) + div`
}

export function adjustArticleInfoBar(signal: AbortSignal) {
    const node = document.querySelector<HTMLDivElement>(selector())
    if (!node) return
    const timer = setInterval(() => {
        if (node.offsetWidth !== node.parentElement?.offsetWidth) return
        node.style.justifyContent = 'flex-start'
        clearInterval(timer)
    }, 250)
    signal.addEventListener('abort', () => clearInterval(timer))
}
