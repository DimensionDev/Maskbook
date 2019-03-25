import React from 'react'
import ReactDOM from 'react-dom'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { AdditionalPostBox } from '../../../components/InjectedComponents/AdditionalPostBox'
import { CryptoService } from '../rpc'

const box = new MutationObserverWatcher(
    new LiveSelector()
        .querySelector('[role="dialog"][aria-label="Create a post"]')
        .map(x => x.lastElementChild)
        .map(x => x.lastElementChild),
)
box.useNodeForeach(node => {
    return {
        onRemove: () => CryptoService.requestRegenerateIV(),
        onTargetChanged: () => CryptoService.requestRegenerateIV(),
    }
}).startWatch()
ReactDOM.render(<AdditionalPostBox />, box.firstVirtualNode.after)
