import type { PropsWithChildren } from 'react'
import { RenameProvider } from './RenameDialog/index.js'

export * from './RenameDialog/index.js'
export * from './FileManagement/index.js'

export function UIProvider({ children }: PropsWithChildren<{}>) {
    return <RenameProvider>{children}</RenameProvider>
}
