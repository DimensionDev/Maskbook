import { MutationObserverWatcher, DOMProxy, LiveSelector } from '@dimensiondev/holoflows-kit'
import { bioPageUserNickNameSelector, floatingBioCardSelector, bioPageUserIDSelector } from '../utils/selector'
import type { PostInfo } from '../../../social-network/PostInfo'
import Services from '../../../extension/service'
import { ProfileIdentifier } from '../../../database/type'
import { MaskIcon } from '../../../resources/MaskIcon'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { memoizePromise } from '../../../utils/memoize'
import { Flags } from '../../../utils/flags'
import { startWatch } from '../../../utils/watcher'

function Icon(props: { size: number }) {
    return (
        <MaskIcon
            style={{
                width: props.size,
                height: props.size,
                verticalAlign: 'text-bottom',
                marginLeft: 6,
            }}
        />
    )
}
function _(main: () => LiveSelector<HTMLElement, true>, size: number, signal: AbortSignal) {
    // TODO: for unknown reason the MutationObserverWatcher doesn't work well
    // To reproduce, open a profile and switch to another profile.
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()
            const check = () => {
                ifUsingMaskbook(
                    new ProfileIdentifier('twitter.com', bioPageUserIDSelector(main).evaluate() || ''),
                ).then(() => {
                    const root = createReactRootShadowed(meta.afterShadow, { signal })
                    root.render(<Icon size={size} />)
                    remover = root.destory
                }, remove)
            }
            check()
            return {
                onNodeMutation: check,
                onTargetChanged: check,
                onRemove: remove,
            }
        }),
        signal,
    )
}

export function injectMaskUserBadgeAtTwitter(signal: AbortSignal) {
    // profile
    _(bioPageUserNickNameSelector, 24, signal)
    // floating bio
    _(floatingBioCardSelector, 20, signal)
}
export function injectMaskIconToPostTwitter(post: PostInfo, signal: AbortSignal) {
    const ls = new LiveSelector([post.rootNodeProxy])
        .map((x) =>
            x.current.parentElement?.parentElement?.previousElementSibling?.querySelector<HTMLDivElement>(
                'a[role="link"] > div > div:first-child',
            ),
        )
        .enableSingleMode()
    ifUsingMaskbook(post.postBy.getCurrentValue()).then(add, remove)
    post.postBy.subscribe(() => ifUsingMaskbook(post.postBy.getCurrentValue()).then(add, remove))
    let remover = () => {}
    function add() {
        if (signal?.aborted) return
        const node = ls.evaluate()
        if (!node) return
        const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        proxy.realCurrent = node
        const root = createReactRootShadowed(proxy.afterShadow, { signal })
        root.render(<Icon size={24} />)
        remover = root.destory
    }
    function remove() {
        remover()
    }
}
export const ifUsingMaskbook = memoizePromise(
    (pid: ProfileIdentifier) =>
        Services.Identity.queryProfile(pid).then((x) => (!!x.linkedPersona ? Promise.resolve() : Promise.reject())),
    (pid: ProfileIdentifier) => pid.toText(),
)
