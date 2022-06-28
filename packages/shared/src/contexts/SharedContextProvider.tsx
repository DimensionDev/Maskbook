import type { FC, PropsWithChildren } from 'react'
import { BaseSharedUIProvider } from './base'
import { CommonUIProvider } from './common'

export const SharedContextProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <BaseSharedUIProvider>
            <CommonUIProvider>{children}</CommonUIProvider>
        </BaseSharedUIProvider>
    )
}
