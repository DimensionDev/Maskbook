import { useContext, useLayoutEffect } from 'react'
import { PageTitleContext } from '../context.js'

export function useTitle(title: string, customBackHandler?: () => void) {
    const { setTitle, setCustomBackHandler } = useContext(PageTitleContext)

    useLayoutEffect(() => {
        setTitle(title)
        if (customBackHandler) setCustomBackHandler(() => customBackHandler)
    }, [title, customBackHandler])
}
