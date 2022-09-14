import type { FC, PropsWithChildren } from 'react'
import { BaseSharedUIProvider } from './base/index.js'
import { CommonUIProvider } from './common/index.js'

export const SharedContextProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <BaseSharedUIProvider>
            <CommonUIProvider>{children}</CommonUIProvider>
        </BaseSharedUIProvider>
    )
}
