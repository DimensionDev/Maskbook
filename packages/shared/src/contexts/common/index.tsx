import type { FC, PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog'

export * from './Confirm'
export * from './SelectFungibleTokenDialog'

export const CommonUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <ConfirmProvider>
            <SelectFungibleTokenProvider>{children}</SelectFungibleTokenProvider>
        </ConfirmProvider>
    )
}
