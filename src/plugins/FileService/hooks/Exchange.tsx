import React from 'react'
import type { FileInfo } from '../types'

export interface Props {
    onInsert(info: FileInfo | null): void
}

const Context = React.createContext<Props>({
    onInsert() {},
})

export const Exchange: React.FC<Props> = ({ onInsert, children }) => {
    const value = { onInsert }
    return <Context.Provider value={value} children={children} />
}

export const useExchange = () => React.useContext(Context)
