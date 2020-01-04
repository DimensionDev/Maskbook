import React from 'react'
import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import { LiveSelector, MutationObserverWatcher as MOW } from '@holoflows/kit'
import { hasDraftEditor, newPostEditorBelow, postPopupInjectPointSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostInfo, SocialNetworkUIInjections } from '../../../social-network/ui'
import { injectPostInspectorDefault } from '../../../social-network/defaults/injectPostInspector'
import { injectKnownIdentityAtTwitter } from './injectKnownIdentity'

function AdditionalPostBoxInTwitter() {
    return (
        <div style={{ maxWidth: 600 }}>
            <AdditionalPostBox />
        </div>
    )
}

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

const emptyNode = document.createElement('div')

const injectPostBox = () => {
    const target = newMOW(newPostEditorBelow().map(x => (hasDraftEditor(x) ? x : emptyNode)))
    renderInShadowRoot(<AdditionalPostBoxInTwitter />, target.firstDOMProxy.afterShadow)
    const popUpTarget = newMOW(postPopupInjectPointSelector())
    renderInShadowRoot(<AdditionalPostBoxInTwitter />, popUpTarget.firstDOMProxy.afterShadow)
}

const injectPostInspector = (current: PostInfo) => {
    return injectPostInspectorDefault({})(current)
}

export const twitterUIInjections: SocialNetworkUIInjections = {
    injectPostBox,
    injectPostInspector,
    injectKnownIdentity: injectKnownIdentityAtTwitter,
}
