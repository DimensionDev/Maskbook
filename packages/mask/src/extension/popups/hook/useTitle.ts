import { useContext } from 'react'
import { PageTitleContext } from '../context'
import { useMount } from 'react-use'

export function useTitle(title: string) {
    const { setTitle } = useContext(PageTitleContext)

    useMount(() => {
        setTitle(title)
    })
}
