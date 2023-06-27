// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { createContext } from 'react'

export interface PageTitleState {
    title: string
    extension?: React.ReactNode
    setExtension: (extension: React.ReactNode | undefined) => void
    setTitle: (title: string) => void
}

export const PageTitleContextDefault = {
    title: '',
    extension: null,
    setExtension: () => {},
    setTitle: () => {},
}

export const PageTitleContext = createContext<PageTitleState>(PageTitleContextDefault)
PageTitleContext.displayName = 'PageTitleContext'
