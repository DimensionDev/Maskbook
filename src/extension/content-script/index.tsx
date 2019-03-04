import React from 'react'
import ReactDOM from 'react-dom'
import { LiveSelector, Watcher } from '@holoflows/kit'
import { AdditionalPostBox } from '../../components/InjectedComponents/AdditionalPostBox'

const box = new Watcher(
    new LiveSelector()
        .querySelector('[role="dialog"][aria-label="Create a post"]')
        .map(x => x.lastElementChild)
        .map(x => x.lastElementChild),
).startWatch()
ReactDOM.render(<AdditionalPostBox />, box.virtualNode.after)
