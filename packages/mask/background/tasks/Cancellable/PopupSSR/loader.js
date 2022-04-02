// This is a JS file to make TypeScript happy.
import { render as _ } from '../../../../src/extension/popups/SSR-server.tsx'

export let render = _
import.meta.webpackHot &&
    import.meta.webpackHot.accept('../../../../src/extension/popups/SSR-server.tsx', () => (render = _))
