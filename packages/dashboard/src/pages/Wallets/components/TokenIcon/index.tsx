import { ChainId, resolveChainFullName, useBlockie, useChainDetailed } from '@dimensiondev/web3-shared'
import type { AvatarProps } from '@material-ui/core'
import { Avatar } from '@material-ui/core'
import { memo } from 'react'
import { useImageFailOver } from '../../../../hooks/useImageFailOver'
import { resolveTokenIconURL } from '../../../../utils/resolveTokenIconURL'

export interface TokenIconProps {
    address: string
    name?: string
    logoURL?: string
    chainId?: ChainId
    AvatarProps?: Partial<AvatarProps>
}

export const TokenIcon = memo<TokenIconProps>(({ address, name, logoURL, chainId, AvatarProps }) => {
    const chainDetailed = useChainDetailed()
    const tokenBlockie = useBlockie(address)

    const fullName = chainDetailed ? resolveChainFullName(chainId ?? chainDetailed.chainId) : ''

    const { value: baseURI, loading } = useImageFailOver(
        chainDetailed
            ? [
                  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${fullName.toLowerCase()}`,
                  `https://rawcdn.githack.com/trustwallet/assets/master/blockchains/${fullName.toLowerCase()}`,
              ]
            : [],
        '/info/logo.png',
    )

    return (
        <TokenIconUI
            logoURL={logoURL}
            loading={loading}
            address={address}
            baseURI={baseURI as string}
            AvatarProps={AvatarProps}
            tokenBlockie={tokenBlockie}
            name={name}
        />
    )
})

export interface TokenIconUIProps {
    logoURL?: string
    loading: boolean
    address: string
    baseURI: string
    AvatarProps?: Partial<AvatarProps>
    tokenBlockie: string
    name?: string
}

export const TokenIconUI = memo<TokenIconUIProps>(
    ({ logoURL, loading, address, baseURI, AvatarProps, tokenBlockie, name }) => {
        if (logoURL) {
            return (
                <Avatar src={logoURL} {...AvatarProps}>
                    {name?.substr(0, 1).toLocaleUpperCase()}
                </Avatar>
            )
        }

        return (
            <Avatar src={loading ? '' : resolveTokenIconURL(address, baseURI)} {...AvatarProps}>
                <Avatar src={tokenBlockie}>name?.substr(0,1).toLocaleUpperCase()</Avatar>
            </Avatar>
        )
    },
)
