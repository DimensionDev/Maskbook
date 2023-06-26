import type { PropsWithChildren } from 'react'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog/index.js'

export * from './SelectFungibleTokenDialog/index.js'

export function CommonUIProvider({ children }: PropsWithChildren<{}>) {
    return <SelectFungibleTokenProvider>{children}</SelectFungibleTokenProvider>
}
