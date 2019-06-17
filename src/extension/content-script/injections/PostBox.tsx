import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'

const box = new MutationObserverWatcher(
    new LiveSelector()
        .querySelector('[role="main"] [role="dialog"][aria-label]')
        .map(x => x.lastElementChild)
        .map(x => x.lastElementChild),
)
    .enableSingleMode()
    .setDomProxyOption({ afterShadowRootInit: { mode: 'closed' } })
    .startWatch()
renderInShadowRoot(<AdditionalPostBox />, box.firstVirtualNode.afterShadow)
