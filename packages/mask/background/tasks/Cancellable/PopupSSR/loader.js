// This is a JS file to make TypeScript happy.
import { PopupSSR as _ } from '../../../../src/setup.popup.ssr.tsx'

export let PopupSSR = _
import.meta.webpackHot && import.meta.webpackHot.accept('../../../../src/setup.popup.ssr.tsx', () => (PopupSSR = _))
