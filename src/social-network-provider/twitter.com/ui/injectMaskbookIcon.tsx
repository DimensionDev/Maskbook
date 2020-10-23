import React from 'react'
import { MutationObserverWatcher, DOMProxy, LiveSelector } from '@dimensiondev/holoflows-kit/es'
import { bioPageUserNickNameSelector, floatingBioCardSelector, bioPageUserIDSelector } from '../utils/selector'
import type { PostInfo } from '../../../social-network/PostInfo'
import Services from '../../../extension/service'
import { ProfileIdentifier } from '../../../database/type'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { memoizePromise } from '../../../utils/memoize'
import { Flags } from '../../../utils/flags'

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
const opt = { afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } } as const
function _(main: () => LiveSelector<HTMLElement, true>, size: number) {
    // TODO: for unknown reason the MutationObserverWatcher doesn't work well
    // To reproduce, open a profile and switch to another profile.
    new MutationObserverWatcher(main())
        .setDOMProxyOption(opt)
        .useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()
            const check = () => {
                ifUsingMaskbook(
                    new ProfileIdentifier('twitter.com', bioPageUserIDSelector(main).evaluate() || ''),
                ).then(() => {
                    remover = renderInShadowRoot(<Icon size={size} />, {
                        normal: () => meta.current,
                        shadow: () => meta.afterShadow,
                    })
                }, remove)
            }
            check()
            return {
                onNodeMutation: check,
                onTargetChanged: check,
                onRemove: remove,
            }
        })
        .startWatch({
            subtree: true,
            childList: true,
            characterData: true,
        })
}
export function injectMaskbookIconToProfile() {
    _(bioPageUserNickNameSelector, 24)
}
export function injectMaskbookIconIntoFloatingProfileCard() {
    _(floatingBioCardSelector, 20)
}
export function injectMaskbookIconToPost(post: PostInfo) {
    const ls = new LiveSelector([post.rootNodeProxy])
        .map((x) =>
            x.current.parentElement?.parentElement?.previousElementSibling?.querySelector<HTMLDivElement>(
                'a[role="link"] > div > div:first-child',
            ),
        )
        .enableSingleMode()
    ifUsingMaskbook(post.postBy.value).then(add, remove)
    post.postBy.addListener((x) => ifUsingMaskbook(x).then(add, remove))
    let remover = () => {}
    function add() {
        const node = ls.evaluate()
        if (!node) return
        const proxy = DOMProxy(opt)
        proxy.realCurrent = node
        remover = renderInShadowRoot(<Icon size={24} />, {
            normal: () => node,
            shadow: () => proxy.afterShadow,
        })
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
