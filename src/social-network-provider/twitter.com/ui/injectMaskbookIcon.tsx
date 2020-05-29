import { bioPageUserNickNameSelector, floatingBioCardSelector, bioPageUserIDSelector } from '../utils/selector'
import { MutationObserverWatcher, DOMProxy, LiveSelector } from '@holoflows/kit/es'
import { getUrl } from '../../../utils/utils'
import type { PostInfo } from '../../../social-network/ui'
import Services from '../../../extension/service'
import { ProfileIdentifier } from '../../../database/type'
const icon = (size: number) => `<img src="${getUrl('/MB--CircleCanvas--WhiteOverBlue.svg')}" style="
    width: ${size}px;
    height: ${size}px;
    vertical-align: text-bottom;
    margin-left: 6px;
" alt="This user is using Maskbook" />`
const opt = { afterShadowRootInit: { mode: 'closed' } } as const
function _(main: () => LiveSelector<HTMLSpanElement, true>, size: number) {
    // TODO: for unknown reason the MutationObserverWatcher doesn't work well
    // To reproduce, open a profile and switch to another profile.
    new MutationObserverWatcher(main())
        .setDOMProxyOption(opt)
        .useForeach((ele, _, meta) => {
            const remove = () => (meta.afterShadow.innerHTML = '')
            const check = () => {
                ifUsingMaskbook(
                    new ProfileIdentifier('twitter.com', bioPageUserIDSelector(main).evaluate() || ''),
                ).then(() => (meta.afterShadow.innerHTML = icon(size)), remove)
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
        .map((x) => x.current.parentElement?.parentElement?.previousElementSibling?.querySelector('span'))
        .enableSingleMode()
    ifUsingMaskbook(post.postBy.value).then(add, remove)
    post.postBy.addListener((x) => ifUsingMaskbook(x).then(add, remove))
    function add() {
        const node = ls.evaluate()
        if (!node) return
        const proxy = DOMProxy(opt)
        proxy.realCurrent = node
        proxy.afterShadow.innerHTML = icon(20)
    }
    function remove() {
        const node = ls.evaluate()
        if (!node) return
        const proxy = DOMProxy(opt)
        proxy.realCurrent = node
        proxy.afterShadow.innerHTML = ''
    }
}
function ifUsingMaskbook(pid: ProfileIdentifier) {
    return Services.Identity.queryProfile(pid).then((x) => (!!x.linkedPersona ? Promise.resolve() : Promise.reject()))
}
