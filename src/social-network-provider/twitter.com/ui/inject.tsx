import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import React from 'react'
import { LiveSelector, MutationObserverWatcher as MOW } from '@holoflows/kit'
import { newPostEditorBelow } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { SocialNetworkUIInjections } from '../../../social-network/ui'
import { nop } from '../../../utils/utils'

/**
 * using a closed shadow root can prevent access from other script.
 */
const newMOW = (i: LiveSelector<HTMLElement, true>) =>
    new MOW(i).setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } }).startWatch()

const injectPostBox = () => {
    const target = newMOW(newPostEditorBelow())
    renderInShadowRoot(<AdditionalPostBox />, target.firstVirtualNode.afterShadow)
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectCommentBox: nop,
    injectPostComments: nop,
    injectWelcomeBanner: nop,
    injectPostInspector: nop, // TODO: implement this
}
