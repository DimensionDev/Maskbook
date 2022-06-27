import type { ChainId } from '@masknet/web3-shared-evm'
import type { FC, PropsWithChildren } from 'react'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'

interface Props {
    chainId: ChainId
}

export const RootContext: FC<PropsWithChildren<Props>> = ({ children, chainId }) => {
    return <TargetChainIdContext.Provider initialState={chainId}>{children}</TargetChainIdContext.Provider>
}
