import { cloneElement, type HTMLAttributes, isValidElement } from 'react'
import { Sniffings } from '@masknet/flags'
import type { ProviderIconClickBaitProps } from '@masknet/web3-shared-base'
import { type ChainId, type NetworkType, ProviderType } from '@masknet/web3-shared-solana'

export function ProviderIconClickBait({
    provider,
    children,
}: ProviderIconClickBaitProps<ChainId, ProviderType, NetworkType>) {
    const disabled = Sniffings.is_dashboard_page && provider.type === ProviderType.Phantom

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
