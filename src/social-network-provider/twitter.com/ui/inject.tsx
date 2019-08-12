import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import React from 'react'
import { MutationObserverWatcher as MOW, ValueRef } from '@holoflows/kit'
import { newCommentEditorSelector, newPostEditorContainerSelector } from '../utils/selectors'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { Banner } from '../../../components/Welcomes/Banner'

const launchSingleMode = (i: MOW<HTMLAnchorElement>) =>
    i
        .enableSingleMode()
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()

// see src/social-network/defaults/injectComments.tsx for more detail about this type.
const launch = (i: MOW<HTMLAnchorElement>, iterator: any) =>
    i
        .useForeach(iterator)
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()

export const injectPostBox = () => {
    const target = launchSingleMode(new MOW(newPostEditorContainerSelector))
    renderInShadowRoot(<AdditionalPostBox />, target.firstVirtualNode.afterShadow)
}

export const injectWelcomeBanner = () => {
    const target = launchSingleMode(new MOW(newPostEditorContainerSelector))
    const unmount = renderInShadowRoot(<Banner unmount={() => unmount()} />, target.firstVirtualNode.afterShadow)
}

export const injectPostComments = () => {
    const target = launch(new MOW(newCommentEditorSelector), commentNode => {
        const ref = new ValueRef(commentNode.current.innerText)
    })
}
