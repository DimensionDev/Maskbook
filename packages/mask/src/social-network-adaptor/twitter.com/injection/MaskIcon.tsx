import { MutationObserverWatcher, DOMProxy, LiveSelector } from '@dimensiondev/holoflows-kit'
import { bioPageUserNickNameSelector, floatingBioCardSelector, bioPageUserIDSelector } from '../utils/selector'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import Services from '../../../extension/service'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { MaskIcon } from '../../../resources/MaskIcon'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { memoizePromise } from '@dimensiondev/kit'
import { startWatch } from '../../../utils/watcher'

function Icon(props: { size: number }) {
    return (
        <MaskIcon
            size={props.size}
            style={{
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
                ifUsingMask(
                    ProfileIdentifier.of(EnhanceableSite.Twitter, bioPageUserIDSelector(main).evaluate()).unwrapOr(
                        null,
                    ),
                ).then(() => {
                    const root = createReactRootShadowed(meta.afterShadow, { signal })
                    root.render(<Icon size={size} />)
                    remover = root.destroy
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
    const ls = new LiveSelector([post.rootElement])
        .map((x) =>
            x.current.parentElement?.parentElement?.previousElementSibling?.querySelector<HTMLDivElement>(
                'a[role="link"] > div > div:first-child',
            ),
        )
        .enableSingleMode()
    ifUsingMask(post.author.getCurrentValue()).then(add, remove)
    post.author.subscribe(() => ifUsingMask(post.author.getCurrentValue()).then(add, remove))
    let remover = () => {}
    function add() {
        if (signal?.aborted) return
        const node = ls.evaluate()
        if (!node) return
        const proxy = DOMProxy({ afterShadowRootInit: { mode: 'closed' } })
        proxy.realCurrent = node
        const root = createReactRootShadowed(proxy.afterShadow, { signal })
        root.render(<Icon size={24} />)
        remover = root.destroy
    }
    function remove() {
        remover()
    }
}
export const ifUsingMask = memoizePromise(
    async (pid: ProfileIdentifier | null) => {
        if (!pid) throw new Error()
        const p = await Services.Identity.queryProfilesInformation([pid])
        if (!p[0].linkedPersona?.rawPublicKey) throw new Error()
    },
    (x) => x,
)
