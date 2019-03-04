import React from 'react'
import ReactDOM from 'react-dom'
import EncryptionCheckbox from '../../components/InjectedComponents/EncryptionCheckbox'
import { LiveSelector, Watcher } from '@holoflows/kit'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import { MaskbookLightTheme } from '../../utils/theme'

/** Selector for 'Create a new post' title */
const afterCreatePost = new Watcher(
    new LiveSelector()
        .querySelectorAll('[aria-label="Create a post"] a')
        .filter(x => x.innerHTML.toLowerCase().match('post'))
        .map(x => x.parentElement)
        .map(x => (x.parentElement instanceof HTMLDivElement ? x : x.parentElement))
        .filter(x => x),
).startWatch()
afterCreatePost.virtualNode.after.style.cssFloat = 'right'
afterCreatePost.virtualNode.after.style.marginTop = '-4px'

let encryptionEnabled = false
ReactDOM.render(
    <MuiThemeProvider theme={MaskbookLightTheme}>
        <EncryptionCheckbox onCheck={v => (encryptionEnabled = v)} />
    </MuiThemeProvider>,
    afterCreatePost.virtualNode.after,
)

const postContent = new LiveSelector()
    .querySelector<HTMLDivElement>('[aria-label="Create a post"] [contenteditable]')
    .map(x => x.innerText)

const postButton = new Watcher(
    new LiveSelector().querySelector('[aria-label="Create a post"] button[type=submit]'),
).startWatch()
console.log('Maskbook loaded')
;(window as any).deb = { LiveSelector, Watcher, afterCreatePost, postContent, postButton }
postButton.virtualNode.current.addEventListener(
    'click',
    e => {
        console.log(`Maskbook: Encrypt = ${encryptionEnabled}, Post = ${postContent.evaluateOnce()}`)
        e.preventDefault()
    },
    true,
)
export default 0
