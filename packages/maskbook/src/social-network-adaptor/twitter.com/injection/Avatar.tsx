import { DOMProxy, LiveSelector } from '@dimensiondev/holoflows-kit'
import { memoizePromise } from '@dimensiondev/kit'
import { NFTAvatarIcon } from '@masknet/icons'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { resolveOpenSeaLink } from '@masknet/web3-shared'
import Services from '../../../extension/service'
import { gun2 } from '../../../network/gun/version.2'
import type { PostInfo } from '../../../social-network/PostInfo'
import { createReactRootShadowed, Flags } from '../../../utils'
import type { AvatarMetaData } from './profileNFTAvatar'

async function getNFTAvatorMeta(twitterId: string) {
    return (await gun2.get(twitterId).then!()) as AvatarMetaData
}

function updateNFTAvatar(parent: HTMLDivElement, avatarMeta: AvatarMetaData) {
    const eleAvator = parent.querySelector<HTMLDivElement>('div > :nth-child(2) > div > div')
    if (!eleAvator) return
    eleAvator.style.backgroundImage = `url(${new URL(avatarMeta.image ?? '', import.meta.url)})`
    const eleAvatorImage = eleAvator?.querySelector('img')
    if (!eleAvatorImage) return
    eleAvatorImage.setAttribute('src', `url(${new URL(avatarMeta.image ?? '', import.meta.url)})`)
}

export function injectAvatorInTwitter(post: PostInfo, signal: AbortSignal) {
    const ls = new LiveSelector([post.rootNodeProxy])
        .map((x) =>
            x.current.parentElement?.parentElement?.previousElementSibling?.parentElement?.parentElement?.querySelector<HTMLDivElement>(
                'div > a',
            ),
        )
        .enableSingleMode()

    ifUsingMaskbook(post.postBy.getCurrentValue()).then(add, remove)
    post.postBy.subscribe(() => ifUsingMaskbook(post.postBy.getCurrentValue()).then(add, remove))
    let remover = () => {}
    async function add() {
        if (signal?.aborted) return
        const node = ls.evaluate()
        if (!node) return
        const avatarMeta = await getNFTAvatorMeta(post.postBy.getCurrentValue().userId)
        if (!avatarMeta || !avatarMeta.image) return

        const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        proxy.realCurrent = node
        updateNFTAvatar(node, avatarMeta)
        const root = createReactRootShadowed(proxy.afterShadow, { signal })
        root.render(
            <div
                style={{ display: 'flex', justifyContent: 'center' }}
                onClick={() => (location.href = resolveOpenSeaLink(avatarMeta.address, avatarMeta.tokenId))}>
                <NFTAvatarIcon />
            </div>,
        )
        remover = root.destory
    }
    function remove() {
        remover()
    }
}

const ifUsingMaskbook = memoizePromise(
    (pid: ProfileIdentifier) =>
        Services.Identity.queryProfile(pid).then((x) => (!!x.linkedPersona ? Promise.resolve() : Promise.reject())),
    (pid: ProfileIdentifier) => pid.toText(),
)
