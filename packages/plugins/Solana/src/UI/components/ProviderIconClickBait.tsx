import { isDashboardPage } from '@masknet/shared-base'
import type { ProviderIconClickBaitProps } from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'
import { cloneElement, HTMLAttributes, isValidElement } from 'react'

export function ProviderIconClickBait({
    provider,
    children,
}: ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>) {
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
