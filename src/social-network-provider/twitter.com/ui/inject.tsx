import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import React from 'react'
import { LiveSelector, MutationObserverWatcher as MOW } from '@holoflows/kit'
import { newPostEditorSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { Banner } from '../../../components/Welcomes/Banner'

const newMOW = (i: LiveSelector<HTMLElement>) =>
    new MOW(i)
        .enableSingleMode()
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()

export const injectPostBox = () => {
    const target = newMOW(newPostEditorSelector)
    renderInShadowRoot(<AdditionalPostBox />, target.firstVirtualNode.afterShadow)
}

export const injectWelcomeBanner = () => {
    const target = newMOW(newPostEditorSelector)
    const unmount = renderInShadowRoot(<Banner unmount={() => unmount()} />, target.firstVirtualNode.afterShadow)
}
