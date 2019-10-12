import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import { isMobileFacebook } from '../isMobile'

let composeBox: LiveSelector<Element>
if (isMobileFacebook) {
    composeBox = new LiveSelector().querySelector('#structured_composer_form')
} else {
    composeBox = new LiveSelector()
        .querySelector('[aria-multiline="true"][contenteditable="true"][role="textbox"]')
        .closest('[role="dialog"], #pagelet_event_composer')
        .map(x => (x.getAttribute('role') === 'dialog' ? x.lastElementChild!.lastElementChild : x))
}
export function injectPostBoxFacebook() {
    const watcher = new MutationObserverWatcher(composeBox.clone().enableSingleMode())
        .setDOMProxyOption({ afterShadowRootInit: { mode: 'closed' } })
        .startWatch({
            childList: true,
            subtree: true,
        })
    renderInShadowRoot(<AdditionalPostBox />, watcher.firstDOMProxy.afterShadow)
}
