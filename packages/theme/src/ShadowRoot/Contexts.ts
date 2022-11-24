import { createContext } from 'react'
import type { StyleSheet } from './ShadowRootStyleSheet.js'

/** @internal */
export const StyleSheetsContext = createContext<StyleSheet>(null!)
StyleSheetsContext.displayName = 'StyleSheetsContext'

/** @internal */
export const PreventShadowRootEventPropagationListContext = createContext<Array<keyof HTMLElementEventMap>>([])
PreventShadowRootEventPropagationListContext.displayName = 'PreventShadowRootEventPropagationListContext'

/** This context does not join any ShadowRoot related feature. */
export const DisableShadowRootContext = createContext(false)
DisableShadowRootContext.displayName = 'DisableShadowRootContext'

/** @internal */
export const stopPropagation = (e: Event): void => e.stopPropagation()
