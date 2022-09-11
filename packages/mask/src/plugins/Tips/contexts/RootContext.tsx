import type { FC, PropsWithChildren } from 'react'
import { TargetRuntimeContext } from './TargetRuntimeContext.js'

export const RootContext: FC<PropsWithChildren<{}>> = ({ children }) => {
    return <TargetRuntimeContext.Provider>{children}</TargetRuntimeContext.Provider>
}
