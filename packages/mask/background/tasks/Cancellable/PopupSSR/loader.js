// This is a JS file to make TypeScript happy.
import { render as _ } from '../../../../src/setup.popup.ssr.tsx'

export let render = _
import.meta.webpackHot && import.meta.webpackHot.accept('../../../../src/setup.popup.ssr.tsx', () => (render = _))
