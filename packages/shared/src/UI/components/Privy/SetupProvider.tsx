import { assert } from '@masknet/shared-base'
import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth'
import type { PropsWithChildren } from 'react'
import { chains } from './configs'

export function PrivySetupProvider({ children }: PropsWithChildren) {
    assert(process.env.PRIVY_APP_ID, 'Missing PRIVY_APP_ID')
    return (
        <PrivyProvider
            appId={process.env.PRIVY_APP_ID}
            config={{
                supportedChains: chains as unknown as PrivyClientConfig['supportedChains'],
            }}>
            {children}
        </PrivyProvider>
    )
}
