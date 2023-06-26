import { useContext, useLayoutEffect } from 'react'
import { PageTitleContext } from '../context.js'

export function useTitle(title: string) {
    const { setTitle } = useContext(PageTitleContext)

    useLayoutEffect(() => {
        setTitle(title)
    }, [title])
}
