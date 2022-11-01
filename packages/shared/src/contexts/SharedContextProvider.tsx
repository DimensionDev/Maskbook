import { compose } from '@masknet/shared-base'
import type { PropsWithChildren } from 'react'
import { BaseSharedUIProvider } from './base/index.js'
import { CommonUIProvider } from './common/index.js'

export function SharedContextProvider({ children }: PropsWithChildren<{}>) {
    return compose(
        (children) => BaseSharedUIProvider({ children }),
        (children) => CommonUIProvider({ children }),
        <>{children}</>,
    )
}
