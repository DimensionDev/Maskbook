import { PrivyProvider } from '@privy-io/react-auth'
import { type PropsWithChildren } from 'react'
import { chains } from './configs'

export function PrivySetupProvider({ children }: PropsWithChildren) {
    if (!process.env.PRIVY_APP_ID) {
        return (
            <span>
                No <code>process.env.PRIVY_APP_ID</code> set.
            </span>
        )
    }
    return (
        <PrivyProvider
            appId={process.env.PRIVY_APP_ID}
            config={{
                supportedChains: chains,
            }}>
            {children}
        </PrivyProvider>
    )
}
