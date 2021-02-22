/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />
// @ts-ignore in case circle dependency make typescript complains
import { Dashboard, setService } from '@dimensiondev/dashboard'
import Services from '../service'
setService(Services)

import ReactDOM from 'react-dom'
import { StylesProvider } from '@material-ui/core/styles'

const root = document.createElement('div')
document.body.insertBefore(root, document.body.children[0])
ReactDOM.unstable_createRoot(root).render(
    <StylesProvider injectFirst>
        <Dashboard />
    </StylesProvider>,
)
