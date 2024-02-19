import { useChainContext } from '@masknet/web3-hooks-base'
import { useEffect, type PropsWithChildren } from 'react'
import { SelectProviderModal } from '../../modals/index.js'

export function WalletGuard({ children }: PropsWithChildren<{}>) {
    const { account } = useChainContext()
    useEffect(() => {
        if (account) return
        SelectProviderModal.open()
    }, [!account])

    if (!account) return null
    return children
}
