import React from 'react'

export interface FileInfo {
    name: string
    size: number
    createdAt: Date

    key: string | null | undefined
    payloadTxID: string
    landingTxID: string

    checksum: Uint8Array
}

export interface Props {
    onInsert(info: FileInfo): void
}

const Context = React.createContext<Props>({
    onInsert() {},
})

export const Exchange: React.FC<Props> = ({ onInsert, children }) => {
    const value = { onInsert }
    return <Context.Provider value={value} children={children} />
}

export const useExchange = () => React.useContext(Context)
