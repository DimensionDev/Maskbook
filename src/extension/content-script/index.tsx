import React from 'react'
import ReactDOM from 'react-dom'
import { LiveSelector, Watcher } from '@holoflows/kit'
import { AdditionalPostBox } from '../../components/InjectedComponents/AdditionalPostBox'
import { DecryptedPost } from '../../components/InjectedComponents/DecryptedPost'

const box = new Watcher(
    new LiveSelector()
        .querySelector('[role="dialog"][aria-label="Create a post"]')
        .map(x => x.lastElementChild)
        .map(x => x.lastElementChild),
).startWatch()
ReactDOM.render(<AdditionalPostBox encrypt={x => btoa(unescape(encodeURIComponent(x)))} />, box.virtualNode.after)

new Watcher(
    new LiveSelector().querySelectorAll<HTMLDivElement>('.userContent').filter((x: HTMLElement | null) => {
        while (x) {
            if (x.classList.contains('hidden_elem')) return false
            // tslint:disable-next-line: no-parameter-reassignment
            x = x.parentElement
        }
        return true
    }),
)
    .useNodeForeach((virtualNode, key, realNode) => {
        const Comp = () => {
            const text = virtualNode.current.innerText.match(/Decrypt this post with maskbook\:\/\/?(?<text>.+)/)
            if (!text) return null
            try {
                return <DecryptedPost decryptedContent={decodeURIComponent(escape(atob(text.groups!.text)))} />
            } catch (e) {
                return <DecryptedPost decryptedContent="Decrypt failed" />
            }
        }
        ReactDOM.render(<Comp />, virtualNode.after)
        return {
            onCurrentChange: () => ReactDOM.render(<Comp />, virtualNode.after),
            remove: () => ReactDOM.unmountComponentAtNode(virtualNode.after),
        }
    })
    .startWatch()
