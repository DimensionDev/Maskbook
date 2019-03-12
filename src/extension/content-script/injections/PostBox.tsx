import React from 'react'
import ReactDOM from 'react-dom'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'

const box = new MutationObserverWatcher(
    new LiveSelector()
        .querySelector('[role="dialog"][aria-label="Create a post"]')
        .map(x => x.lastElementChild)
        .map(x => x.lastElementChild),
)
box.startWatch()
ReactDOM.render(<AdditionalPostBox />, box.firstVirtualNode.after)
