import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTAvatarAmountIcon } from '@masknet/icons'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { resolveOpenSeaLink } from '@masknet/web3-shared'
import { Link, Typography } from '@material-ui/core'
import { getNFTAvatar, setOrClearAvatar } from '../../../components/InjectedComponents/NFTAvatar'
import Services from '../../../extension/service'
import type { PostInfo } from '../../../social-network/PostInfo'
import { createReactRootShadowed, Flags, memoizePromise, startWatch } from '../../../utils'
import { selfInfoSelectors } from '../utils/selector'
import { updateAvatarFromDB, updateAvatarImage } from '../utils/updateAvatarImage'

export function injectAvatorInTwitter(signal: AbortSignal, post: PostInfo) {
    const ls = new LiveSelector([post.rootNodeProxy])
        .map((x) => x.current.firstChild?.firstChild?.firstChild as HTMLDivElement)
        .enableSingleMode()

    ifUsingMaskbook(post.postBy.getCurrentValue()).then(add, remove)
    post.postBy.subscribe(() => ifUsingMaskbook(post.postBy.getCurrentValue()).then(add, remove))
    let remover = () => {}
    async function add() {
        if (signal?.aborted) return
        const node = ls.evaluate()
        if (!node) return
        const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        proxy.realCurrent = node
        const avatarParentNode = node.firstChild?.firstChild?.lastChild?.firstChild as HTMLDivElement
        if (!avatarParentNode) return
        const avatarMeta = await getNFTAvatar(post.postBy.getCurrentValue().userId)
        if (!avatarMeta || !avatarMeta.image) {
            setOrClearAvatar(post.postBy.getCurrentValue().userId)
            updateAvatarImage(avatarParentNode)
            return
        }
        updateAvatarImage(avatarParentNode, avatarMeta.image)
        const root = createReactRootShadowed(proxy.afterShadow, { signal })
        root.render(
            <div
                style={{ display: 'flex', justifyContent: 'center', position: 'absolute', left: 0, top: 44 }}
                onClick={(e) => {
                    e.preventDefault()
                    window.open(resolveOpenSeaLink(avatarMeta.address, avatarMeta.tokenId), '_blank')
                }}>
                <Link
                    title={resolveOpenSeaLink(avatarMeta.address, avatarMeta.tokenId)}
                    href={resolveOpenSeaLink(avatarMeta.address, avatarMeta.tokenId)}
                    target="_blank"
                    rel="noopener noreferrer">
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
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                        <Typography
                            style={{
                                fontSize: 10,
                                transform: 'scale(0.8)',
                                margin: 0,
                                color: 'white',
                                whiteSpace: 'nowrap',
                                textShadow: '2px 1px black',
                                lineHeight: 1,
                            }}>{`${avatarMeta.amount} ETH`}</Typography>
                    </div>
                </Link>
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
            const check = () => updateAvatarFromDB(parent, twitterId)
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

export async function injectUserNFTAvatarAtTwitter(signal: AbortSignal) {
    const twitterId = selfInfoSelectors().handle.evaluate()
    /*
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

      _(twitterMainAvatarSelector, signal, twitterId, twitterMainAvatarSelector().evaluate())
      */
}

const ifUsingMaskbook = memoizePromise(
    (pid: ProfileIdentifier) =>
        Services.Identity.queryProfile(pid).then((x) => (!!x.linkedPersona ? Promise.resolve() : Promise.reject())),
    (pid: ProfileIdentifier) => pid.toText(),
)
