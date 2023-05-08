import { cloneElement, type HTMLAttributes, isValidElement } from 'react'
import { isDashboardPage } from '@masknet/shared-base'
import type { ProviderIconClickBaitProps } from '@masknet/web3-shared-base'
import { type ChainId, type NetworkType, ProviderType } from '@masknet/web3-shared-solana'

export function ProviderIconClickBait({
    provider,
    children,
}: ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>) {
    const disabled = isDashboardPage && provider.type === ProviderType.Phantom

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
