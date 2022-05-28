import { context } from '../context'
import { useSubscription } from 'use-subscription'
import { ChainBoundary, ChainBoundaryProps, useNextIDWallets } from '@masknet/shared'

interface CyberConnectChainBoundaryProps extends ChainBoundaryProps {
    children?: React.ReactElement
}

export function CyberConnectChainBoundary(props: CyberConnectChainBoundaryProps) {
    const identifier = useSubscription(context.lastRecognizedProfile)
    const { loading, value: wallets = [] } = useNextIDWallets(identifier)

    return (
        <ChainBoundary
            {...props}
            updateAccount={context.updateAccount}
            walletStatusBarProps={{
                actionProps: {
                    wallets,
                    loading,
                },
            }}>
            {props.children}
        </ChainBoundary>
    )
}
