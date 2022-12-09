import type { FC, PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm/index.js'
import { RenameProvider } from './RenameDialog/index.js'

export * from './Confirm/index.js'
export * from './RenameDialog/index.js'
export * from './FileManagement/index.js'

export const UIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <ConfirmProvider>
            <RenameProvider>{children}</RenameProvider>
        </ConfirmProvider>
    )
}
