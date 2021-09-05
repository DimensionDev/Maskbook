import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTAvatarAmountIcon } from '@masknet/icons'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { resolveOpenSeaLink } from '@masknet/web3-shared'
import { Typography } from '@material-ui/core'
import Services from '../../../extension/service'
import { gun2 } from '../../../network/gun/version.2'
import type { PostInfo } from '../../../social-network/PostInfo'
import { createReactRootShadowed, Flags, memoizePromise, startWatch } from '../../../utils'
import { searchAccountSwitherButtonSelector, searchUseCellSelector, selfInfoSelectors } from '../utils/selector'
import type { AvatarMetaData } from './profileNFTAvatar'

async function getNFTAvatorMeta(twitterId: string) {
    return (await gun2.get(twitterId).then!()) as AvatarMetaData
}

function updateNFTAvatar(avatarMeta: AvatarMetaData, parent: HTMLDivElement | null) {
    if (!parent) return
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
                'div',
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
        updateNFTAvatar(avatarMeta, node.querySelector<HTMLDivElement>('a'))
        const root = createReactRootShadowed(proxy.afterShadow, { signal })
        root.render(
            <div
                style={{ display: 'flex', justifyContent: 'center', position: 'absolute', left: 0, top: 48 }}
                onClick={(e) => {
                    e.preventDefault()
                    window.open(resolveOpenSeaLink(avatarMeta.address, avatarMeta.tokenId), '_blank')
                }}>
                <NFTAvatarAmountIcon style={{ width: '100%', paddingLeft: 10 }} />
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 10,
                        background:
                            'linear-gradient(106.15deg, #FF0000 5.97%, #FF8A00 21.54%, #FFC700 42.35%, #52FF00 56.58%, #00FFFF 73.01%, #0038FF 87.8%, #AD00FF 101.49%, #FF0000 110.25%)',
                        borderRadius: 3,
                        minWidth: 43,
                        width: 'auto',
                    }}>
                    <Typography
                        style={{
                            fontSize: 10,
                            transform: 'scale(0.8)',
                            margin: 0,
                            color: 'white',
                            whiteSpace: 'nowrap',
                            textShadow: '2px 1px black',
                        }}>{`${avatarMeta.amount} ETH`}</Typography>
                </div>
            </div>,
        )
        remover = root.destory
    }
    function remove() {
        remover()
    }
}

function _(main: () => LiveSelector<HTMLElement, true>, signal: AbortSignal, twitterId?: string, parent?: HTMLElement) {
    // TODO: for unknown reason the MutationObserverWatcher doesn't work well
    // To reproduce, open a profile and switch to another profile.
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            const check = () => updateAvatar(parent, twitterId)
            check()
            return {
                onNodeMutation: check,
                onTargetChanged: check,
                onRemove: () => {},
            }
        }),
        signal,
    )
}

function updateAvatar(parent?: HTMLElement, twitterId?: string) {
    if (!parent || !twitterId) return
    getNFTAvatorMeta(twitterId).then((avatarMeta: AvatarMetaData) => {
        const ele = parent.firstChild as HTMLElement
        if (ele) ele.style.backgroundImage = `url(${new URL(avatarMeta.image ?? '', import.meta.url)})`
        const image = parent.lastChild as HTMLElement
        if (image) image.setAttribute('src', `url(${new URL(avatarMeta.image ?? '', import.meta.url)})`)
    })
}

export async function injectUserNFTAvatarAtTwitter(signal: AbortSignal) {
    const twitterId = selfInfoSelectors().handle.evaluate()

    _(
        searchAccountSwitherButtonSelector,
        signal,
        searchAccountSwitherButtonSelector()
            .querySelector('div:nth-child(2) > div > :last-child > div > span')
            .evaluate()
            ?.innerHTML.replace('@', '') ?? twitterId,
        searchAccountSwitherButtonSelector().evaluate()?.firstChild?.firstChild?.firstChild?.lastChild
            ?.firstChild as HTMLElement,
    )

    _(
        searchUseCellSelector,
        signal,
        searchUseCellSelector()
            .querySelector<HTMLElement>('div > div:nth-child(2) > div > div > div > :nth-child(2) > div > span')
            .evaluate()
            ?.innerText.replace('@', '') ?? twitterId,
        searchUseCellSelector().querySelector<HTMLElement>('div > div > div > div > :last-child > div').evaluate(),
    )
}

const ifUsingMaskbook = memoizePromise(
    (pid: ProfileIdentifier) =>
        Services.Identity.queryProfile(pid).then((x) => (!!x.linkedPersona ? Promise.resolve() : Promise.reject())),
    (pid: ProfileIdentifier) => pid.toText(),
)
