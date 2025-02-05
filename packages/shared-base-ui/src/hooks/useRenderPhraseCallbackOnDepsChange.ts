import { useState } from 'react'

/**
 * If you're using useEffect like this:
 *
 * ```js
 * const [state, setState] = useState(false)
 * const [state2, setState2] = useState(false)
 * useEffect(() => setState2(false), [state])
 * ```
 * Don't do it. See [Adjusting some state when a prop changes](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
 * It should be like this:
 * ```js
 * const [prev, setPrev] = useState(state)
 * if (prev !== state) {
 *     setPrev(state)
 *     setState2(false)
 * }
 * ```
 * This hook is a helper for the above pattern.
 * ```js
 * useRenderPhraseCallbackOnDepsChange(() => setState2(false), [state])
 * ```
 *
 * This only applies to states of the current component.
 * Modifying states from other components causes React reporting errors.
 * You may also want to read [(Avoid) Notifying parent components about state changes](https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes)
 * and [(Avoid) Passing data to the parent](https://react.dev/learn/you-might-not-need-an-effect#passing-data-to-the-parent).
 * If you really need to edit other components' states, write it like this:
 *
 * ```js
 * useRenderPhraseCallbackOnDepsChange(() => {
 *     setLocalState(false)
 *     Promise.resolve().then(() => props.setParentState(false))
 * }, [state])
 * ```
 *
 * @param callback
 * @param deps
 */
export function useRenderPhraseCallbackOnDepsChange(callback: () => void, deps: unknown[]) {
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [prev, setPrev] = useState(deps)
    let changed = deps.length !== prev.length
    for (let i = 0; i < deps.length; i += 1) {
        if (changed) break
        if (prev[i] !== deps[i]) changed = true
    }
    if (changed) {
        setPrev(deps)
        callback()
    }
}
