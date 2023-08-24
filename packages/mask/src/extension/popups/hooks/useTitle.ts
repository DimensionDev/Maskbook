import { noop } from 'lodash-es'
import { useContext, useLayoutEffect } from 'react'
import { PageTitleContext } from '../context.js'

export function useTitle(title: string, customBackHandler?: () => void) {
    const { setTitle, setCustomBackHandler } = useContext(PageTitleContext)

    useLayoutEffect(() => {
        setTitle(title)
        setCustomBackHandler(() => customBackHandler)
        return () => {
            setTitle('Mask')
            setCustomBackHandler(noop)
        }
    }, [title, customBackHandler])
}
