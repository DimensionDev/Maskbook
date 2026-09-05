import { memoize, noop } from 'lodash-es'
import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Icons } from '@masknet/icons'
import { memoizePromise } from '@masknet/kit'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { Flags } from '@masknet/flags'
import Services from '#services'
import { startWatch, type WatchOptions } from '../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { bioPageUserIDSelector, bioPageUserNickNameSelector, floatingBioCardSelector } from '../utils/selector.js'

function Icon(props: { size: number }) {
    return (
        <Icons.MaskBlue
            size={props.size}
            style={{
                verticalAlign: 'text-bottom',
                marginLeft: 6,
            }}
        />
    )
}
function _(main: () => LiveSelector<HTMLElement, true>, size: number, options: WatchOptions) {
    const watcher = new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
        let remover = noop
        let attached = false
        const remove = () => {
            remover()
            remover = noop
            attached = false
        }
        const check = () => {
            // onNodeMutation/onTargetChanged re-run check() for the same element, and the floating
            // bio card mutates on every hover. attachReactTreeWithContainer refuses a second root
            // under the same shadow key (it logs a console.error and returns a no-op), so attach
            // only once; remove()/onRemove reset this so a genuinely re-added element re-attaches.
            if (attached) return
            attached = true
            ifUsingMask(
                ProfileIdentifier.of(EnhanceableSite.Twitter, bioPageUserIDSelector(main).evaluate()).unwrapOr(null),
            ).then(() => {
                const root = attachReactTreeWithContainer(meta.afterShadow, {
                    untilVisible: true,
                    signal: options.signal,
                })
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
    })
    startWatch(watcher, options)
}

export function injectMaskUserBadgeAtTwitter(signal: AbortSignal) {
    // profile
    _(bioPageUserNickNameSelector, 24, { signal })
    // floating bio
    _(floatingBioCardSelector, 20, { signal })
}
export function injectMaskIconToPostTwitter(post: PostInfo, signal: AbortSignal) {
    const ls = new LiveSelector([post.rootElement])
        .map((x) => x.current.querySelector<HTMLDivElement>('[data-testid=User-Name]'))
        .enableSingleMode()
    // post.author refines several times as post parsing completes (and re-fires on every
    // onNodeMutation of the tweet). Each add() used to attach a brand-new DOMProxy shadow sibling
    // + React root without tearing down the previous one, leaving stacked Mask icons on the post.
    // Reuse a single proxy and keep at most one live tree.
    const proxy = DOMProxy({ afterShadowRootInit: Flags.shadowRootInit })
    let remover = noop
    function add() {
        if (signal?.aborted) return
        const node = ls.evaluate()
        if (!node) return
        remover()
        proxy.realCurrent = node
        const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })
        root.render(<Icon size={24} />)
        remover = root.destroy
    }
    function remove() {
        remover()
        remover = noop
    }
    ifUsingMask(post.author.getCurrentValue()).then(add, remove)
    const unsubscribe = post.author.subscribe(() => ifUsingMask(post.author.getCurrentValue()).then(add, remove))
    signal.addEventListener('abort', unsubscribe, { once: true })
}
const ifUsingMask = memoizePromise(
    memoize,
    async (pid: ProfileIdentifier | null) => {
        if (!pid) throw new Error('pid is null')
        const p = await Services.Identity.queryProfilesInformation([pid])
        if (!p[0].linkedPersona?.rawPublicKey) throw new Error('pid is not linked to a persona')
    },
    (x) => x,
)
