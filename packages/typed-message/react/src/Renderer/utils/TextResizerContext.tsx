import { createContext, useContext, useLayoutEffect, useState } from 'react'

export type TextResizer = (textCount: number) => number
export const TextResizeContext = createContext<TextResizer | boolean>(false)
TextResizeContext.displayName = 'TextResizeContext'

function defaultAlgr(length: number): number {
    let scale = 1
    if (length < 45) scale = 1.5
    else if (length < 80) scale = 1.2
    return scale
}
/** @internal */
export function useTextResize(shouldEnable: boolean) {
    const provider = useContext(TextResizeContext)
    const [element, setElement] = useState<HTMLElement | null>(null)

    useLayoutEffect(() => {
        if (!shouldEnable || !element || !provider) return

        const updateFontSize = () => {
            const algr = typeof provider === 'function' ? provider : defaultAlgr
            const scale = algr(element.textContent?.length ?? 0)
            // eslint-disable-next-line react-compiler/react-compiler
            element.style.fontSize = `${scale}rem`
        }
        updateFontSize()

        const watcher = new MutationObserver(updateFontSize)
        watcher.observe(element, { subtree: true, childList: true, characterData: true })
        return () => watcher.disconnect()
    }, [shouldEnable, provider, element])
    return setElement
}
