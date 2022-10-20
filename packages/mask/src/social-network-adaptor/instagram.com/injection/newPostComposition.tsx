import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { Entry } from './Entry.js'
export function newPostCompositionInstagram(signal: AbortSignal) {
    const container = document.createElement('div')
    const shadow = container.attachShadow({ mode: process.env.shadowRootMode })

    createReactRootShadowed(shadow, { signal }).render(<Entry />)

    document.body.appendChild(container)
    signal.addEventListener('abort', () => container.remove())
}
