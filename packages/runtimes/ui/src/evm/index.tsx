import type { FC } from 'react'
import { TokenPickerProvider } from './TokenPicker'

export * from './TokenPicker'

export const EvmUIRuntimeProvider: FC = ({ children }) => {
    return <TokenPickerProvider>{children}</TokenPickerProvider>
}
