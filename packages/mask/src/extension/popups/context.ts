// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { createContext } from 'react'

export interface PageTitleState {
    title: string
    setTitle: (title: string) => void
}

export const PageTitleContextDefault = {
    title: '',
    setTitle: () => {},
}

export const PageTitleContext = createContext<PageTitleState>(PageTitleContextDefault)
