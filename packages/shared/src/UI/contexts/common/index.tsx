import type { PropsWithChildren } from 'react'
import { AddCollectiblesProvider } from './AddCollectiblesDialog/index.js'

export * from './AddCollectiblesDialog/index.js'

export function CommonUIProvider({ children }: PropsWithChildren<{}>) {
    return <AddCollectiblesProvider>{children}</AddCollectiblesProvider>
}
