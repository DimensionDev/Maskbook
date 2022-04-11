import type { FC, PropsWithChildren } from 'react'
import { TokenPickerProvider } from './TokenPicker'

export * from './TokenPicker'

export const EvmSharedUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => (
    <TokenPickerProvider>{children}</TokenPickerProvider>
)
