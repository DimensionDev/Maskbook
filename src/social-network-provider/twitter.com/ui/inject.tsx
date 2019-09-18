import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import React from 'react'
import { LiveSelector, MutationObserverWatcher as MOW } from '@holoflows/kit'
import { newPostEditorBelow } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { SocialNetworkUIInjections } from '../../../social-network/ui'
import { nop } from '../../../utils/utils'

// Closing these shadowRoot prevents external access to them.
const newMOW = (i: LiveSelector<HTMLElement, true>) =>
    new MOW(i)
        .setDOMProxyOption({
            beforeShadowRootInit: { mode: 'closed' },
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch()

const injectPostBox = () => {
    const target = newMOW(newPostEditorBelow())
    renderInShadowRoot(<AdditionalPostBox />, target.firstDOMProxy.afterShadow)
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectPostInspector: nop, // TODO: implement this
}
