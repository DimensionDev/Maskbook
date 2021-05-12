/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

import { Suspense } from 'react'
import { Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { MaskUIRoot } from '../../UIRoot'

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0] || null)
ReactDOM.unstable_createRoot(root).render(<Dialogs />)

function Dialogs() {
    return MaskUIRoot(
        <Suspense fallback="">
            <HashRouter>
                <Switch></Switch>
            </HashRouter>
        </Suspense>,
    )
}
