import React from 'react'
import ReactDOM from 'react-dom'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'

const box = new MutationObserverWatcher(
    new LiveSelector()
        .querySelector('[role="main"] [role="dialog"][aria-label]')
        .map(x => x.lastElementChild)
        .map(x => x.lastElementChild),
)
box.useNodeForeach(node => {
    return {
        onTargetChanged: () => {
            console.log('target changed')
        },
        onNodeMutation: () => {
            console.log('node mutation')
        },
    }
}).startWatch()
ReactDOM.render(<AdditionalPostBox />, box.firstVirtualNode.after)
