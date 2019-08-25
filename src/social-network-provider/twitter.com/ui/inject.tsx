import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import React from 'react'
import { LiveSelector, MutationObserverWatcher as MOW } from '@holoflows/kit'
import { newPostEditorBelow } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'

const newMOW = (i: LiveSelector<HTMLElement, true>) =>
    new MOW(i)
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()

export const injectPostBox = () => {
    const target = newMOW(newPostEditorBelow())
    renderInShadowRoot(<AdditionalPostBox />, target.firstVirtualNode.afterShadow)
}
