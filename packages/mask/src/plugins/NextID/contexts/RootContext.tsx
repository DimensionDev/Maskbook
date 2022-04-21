import type { FC, PropsWithChildren } from 'react'
import { TargetChainIdContext } from './TargetChainIdContext'

export const RootContext: FC<PropsWithChildren<{}>> = ({ children }) => {
    return <TargetChainIdContext.Provider>{children}</TargetChainIdContext.Provider>
}
