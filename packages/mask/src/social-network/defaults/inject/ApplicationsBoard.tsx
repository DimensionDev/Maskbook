import { ApplicationsBoard } from '../../../components/ApplicationsBoard'
import { createReactRootShadowed } from '../../../utils'

export function injectApplicationsBoardDefault() {
    return function injectApplicationsBoard(signal: AbortSignal) {
        const dom = document.body.appendChild(document.createElement('div')).attachShadow({ mode: 'closed' })

        createReactRootShadowed(dom, { signal, key: 'page-inspector' }).render(<ApplicationsBoard />)
    }
}
