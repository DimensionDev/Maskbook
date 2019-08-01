import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'

let composeBox: LiveSelector<Element>
if (location.hostname.match('m.facebook.com')) {
    composeBox = new LiveSelector().querySelector('#structured_composer_form')
} else {
    composeBox = new LiveSelector()
        .querySelector('[role="main"] [role="dialog"][aria-label]')
        .map(x => x.lastElementChild)
        .map(x => x.firstElementChild)
}
export function injectPostBoxFacebook() {
    const watcher = new MutationObserverWatcher(composeBox)
        .enableSingleMode()
        .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch()
    renderInShadowRoot(<AdditionalPostBox />, watcher.firstVirtualNode.afterShadow)
}
