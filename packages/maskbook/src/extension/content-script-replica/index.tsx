import type {} from 'react/next'
import type {} from 'react-dom/next'

import { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Route, Switch } from 'react-router'
import { HashRouter } from 'react-router-dom'
import { MaskUIRoot } from '../../UIRoot'
import { ReplicaRoute } from './types'

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0] || null)

ReactDOM.createRoot(root).render(<Replica />)

const PostInspector = lazy(() => import('./PostInspector'))
function Replica() {
    return MaskUIRoot(
        <Suspense fallback="">
            <HashRouter>
                <Switch>
                    <Route path={ReplicaRoute.PostInspector + '/:SNSAdaptor/'}>
                        <PostInspector />
                    </Route>
                </Switch>
            </HashRouter>
        </Suspense>,
    )
}
