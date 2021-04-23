import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier } from '../../../database/type'
import Services from '../../../extension/service'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import type { PostInfo } from '../../../social-network/PostInfo'
import { memoizePromise } from '../../../utils/memoize'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { bioPageUserIDSelector } from '../utils/selector'

function Icon(props: { size: number }) {
    return (
        <MaskbookIcon
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
                ifUsingMaskbook(new ProfileIdentifier('minds.com', bioPageUserIDSelector(main).evaluate() || '')).then(
                    () => {
                        const root = createReactRootShadowed(meta.afterShadow, { signal })
                        root.render(<Icon size={size} />)
                        remover = root.destory
                    },
                    remove,
                )
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

// TODO
export function injectMaskUserBadgeAtMinds(signal: AbortSignal) {}

// TODO
export function injectMaskIconToPostMinds(post: PostInfo, signal: AbortSignal) {}

const ifUsingMaskbook = memoizePromise(
    (pid: ProfileIdentifier) =>
        Services.Identity.queryProfile(pid).then((x) => (!!x.linkedPersona ? Promise.resolve() : Promise.reject())),
    (pid: ProfileIdentifier) => pid.toText(),
)
