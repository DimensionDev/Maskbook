import { createContext } from 'react'
import type { StyleSheet } from './ShadowRootStyleSheet.js'

/** @internal */
export const StyleSheetsContext = createContext<readonly StyleSheet[]>([])
/** @internal */
export const PreventEventPropagationListContext = createContext<Array<keyof HTMLElementEventMap>>([])
/** This context does not join any ShadowRoot related feature. */
export const DisableShadowRootContext = createContext(false)

/** @internal */
export const stopPropagation = (e: Event): void => e.stopPropagation()
