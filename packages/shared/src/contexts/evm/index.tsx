import type { FC } from 'react'
import { TokenPickerProvider } from './TokenPicker'

export * from './TokenPicker'

export const EvmSharedUIProvider: FC = ({ children }) => {
    return <TokenPickerProvider>{children}</TokenPickerProvider>
}
