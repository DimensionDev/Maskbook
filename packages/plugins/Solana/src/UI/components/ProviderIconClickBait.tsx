import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { isDashboardPage } from '@masknet/shared-base'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'
import { cloneElement, HTMLAttributes, isValidElement } from 'react'

export function ProviderIconClickBait({
    provider,
    children,
}: Web3Plugin.UI.ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>) {
    const isDashboard = isDashboardPage()
    const disabled = isDashboard && provider.type === ProviderType.Phantom

    return (
        <>
            {isValidElement<object>(children)
                ? cloneElement<HTMLAttributes<HTMLDivElement>>(children, {
                      style: disabled
                          ? {
                                opacity: 0.5,
                            }
                          : undefined,
                      ...children.props,
                  })
                : children}
        </>
    )
}
