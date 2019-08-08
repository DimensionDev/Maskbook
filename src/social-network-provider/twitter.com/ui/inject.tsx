import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import React from 'react'
import { MutationObserverWatcher as MOW } from '@holoflows/kit'
import { newPostEditorContainerSelector } from '../utils/selectors'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { Banner } from '../../../components/Welcomes/Banner'

const launch = (i: MOW<HTMLAnchorElement>) => i
    .enableSingleMode()
    .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
    .startWatch()

export const injectPostBox = () => {
    const target = launch(new MOW(newPostEditorContainerSelector))
    renderInShadowRoot(<AdditionalPostBox/>, target.firstVirtualNode.afterShadow)
}

export const injectWelcomeBanner = () => {
    const target = launch(new MOW(newPostEditorContainerSelector))
    const unmount = renderInShadowRoot(<Banner unmount={() => unmount()}/>, target.firstVirtualNode.afterShadow)
}
