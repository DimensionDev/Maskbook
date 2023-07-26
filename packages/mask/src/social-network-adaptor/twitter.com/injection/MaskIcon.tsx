import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Icons } from '@masknet/icons'
import { memoizePromise } from '@masknet/kit'
import type { PostInfo } from '@masknet/plugin-infra/content-script'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { memoize, noop } from 'lodash-es'
import Services from '../../../extension/service.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import {
    bioPageUserIDSelector,
    bioPageUserNickNameSelector,
    floatingBioCardSelector,
    isProfilePageLike,
} from '../utils/selector.js'
import { Flags } from '@masknet/flags'
import { startWatch, type WatchOptions } from '@masknet/theme'

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
        const remove = () => remover()
        const check = () => {
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
    _(bioPageUserNickNameSelector, 24, { signal, missingReportRule: { name: 'User badge', rule: isProfilePageLike } })
    // floating bio
    _(floatingBioCardSelector, 20, { signal })
}
export function injectMaskIconToPostTwitter(post: PostInfo, signal: AbortSignal) {
    const ls = new LiveSelector([post.rootElement])
        .map((x) => x.current.querySelector<HTMLDivElement>('[data-testid=User-Name]'))
        .enableSingleMode()
    ifUsingMask(post.author.getCurrentValue()).then(add, remove)
    post.author.subscribe(() => ifUsingMask(post.author.getCurrentValue()).then(add, remove))
    let remover = noop
    function add() {
        if (signal?.aborted) return
        const node = ls.evaluate()
        if (!node) return
        const proxy = DOMProxy({ afterShadowRootInit: Flags.shadowRootInit })
        proxy.realCurrent = node
        const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })
        root.render(<Icon size={24} />)
        remover = root.destroy
    }
    function remove() {
        remover()
    }
}
const ifUsingMask = memoizePromise(
    memoize,
    async (pid: ProfileIdentifier | null) => {
        if (!pid) throw new Error()
        const p = await Services.Identity.queryProfilesInformation([pid])
        if (!p[0].linkedPersona?.rawPublicKey) throw new Error()
    },
    (x) => x,
)
