import { useContext } from 'react'
import { useMount } from 'react-use'
import { PageTitleContext } from '../context.js'

export function useTitle(title: string) {
    const { setTitle } = useContext(PageTitleContext)

    useMount(() => {
        setTitle(title)
    })
}
