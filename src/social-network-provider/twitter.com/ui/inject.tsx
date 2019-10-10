import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import React from 'react'
import { LiveSelector, MutationObserverWatcher as MOW } from '@holoflows/kit'
import { newPostEditorBelow, postPopupInjectPointSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostInfo, SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'

// Closing these shadowRoot prevents external access to them.
const newMOW = (i: LiveSelector<HTMLElement, true>) =>
    new MOW(i)
        .setDOMProxyOption({
            beforeShadowRootInit: { mode: 'closed' },
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

const injectPostBox = () => {
    const target = newMOW(newPostEditorBelow())
    renderInShadowRoot(<AdditionalPostBox />, target.firstDOMProxy.afterShadow)
    const popUpTarget = newMOW(postPopupInjectPointSelector())
    renderInShadowRoot(<AdditionalPostBox />, popUpTarget.firstDOMProxy.afterShadow)
}

const injectPostInspector = (current: PostInfo) => {
    return injectPostInspectorDefault({})(current)
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectPostInspector,
}
