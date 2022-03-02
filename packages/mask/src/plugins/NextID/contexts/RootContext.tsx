import type { FC } from 'react'
import { TargetChainIdContext } from './TargetChainIdContext'

export const RootContext: FC = ({ children }) => {
    return <TargetChainIdContext.Provider>{children}</TargetChainIdContext.Provider>
}
