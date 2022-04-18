import type { FC, PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm'

export * from './Confirm'

export const CommonUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return <ConfirmProvider>{children}</ConfirmProvider>
}
