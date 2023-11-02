import { noop } from 'lodash-es'
import { useContext, useLayoutEffect, createContext } from 'react'

interface PageTitleState {
    title: string
    extension?: React.ReactNode
    setExtension: (extension: React.ReactNode | undefined) => void
    setTitle: (title: string) => void
    customBackHandler?: () => void
    setCustomBackHandler: (fn?: () => void) => void
}

const PageTitleContextDefault = {
    title: '',
    extension: null,
    setExtension: () => {},
    setTitle: () => {},
    setCustomBackHandler: () => {},
}

export const PageTitleContext = createContext<PageTitleState>(PageTitleContextDefault)
PageTitleContext.displayName = 'PageTitleContext'

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
