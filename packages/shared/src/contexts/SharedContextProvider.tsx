import type { PropsWithChildren } from 'react'
import { BaseSharedUIProvider } from './base/index.js'
import { CommonUIProvider } from './common/index.js'

export function SharedContextProvider({ children }: PropsWithChildren<{}>) {
    return (
        <BaseSharedUIProvider>
            <CommonUIProvider>{children}</CommonUIProvider>
        </BaseSharedUIProvider>
    )
}
