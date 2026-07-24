import type { Web3Helper } from '@masknet/web3-helpers'
import { createContext, useContext, type PropsWithChildren } from 'react'

export interface ShowTooltipOptions {
    title: string
    message: string
}

export interface RuntimeOptions {
    basePath: string
    pickToken(
        currentToken: Web3Helper.FungibleTokenAll | null | undefined,
        side: 'from' | 'to',
        excludes: Web3Helper.FungibleTokenAll[],
    ): Promise<Web3Helper.FungibleTokenAll | null>
    showToolTip(options: ShowTooltipOptions): void
}

const RuntimeContext = createContext<RuntimeOptions>(null!)
RuntimeContext.displayName = 'RuntimeContext'
export function RuntimeProvider({ children, runtime }: PropsWithChildren<{ runtime: RuntimeOptions }>) {
    return <RuntimeContext value={runtime}>{children}</RuntimeContext>
}

export function useRuntime() {
    return useContext(RuntimeContext)
}
