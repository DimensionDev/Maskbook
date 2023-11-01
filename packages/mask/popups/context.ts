import { createContext } from 'react'

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
