import { createContext } from 'react'
import type { StyleSheet } from './ShadowRootStyleSheet'

/** @internal */
export const StyleSheetsContext = createContext<readonly StyleSheet[]>(null!)
/** @internal */
export const PreventEventPropagationListContext = createContext<(keyof HTMLElementEventMap)[]>([])
/** This context does not join any ShadowRoot related feature. */
export const DisableShadowRootContext = createContext(false)
