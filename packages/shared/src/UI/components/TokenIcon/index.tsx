import { type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useChainContext,
    useEnvironmentContext,
    useFungibleToken,
    useNetworks,
    useWeb3Hub,
} from '@masknet/web3-hooks-base'
import { TokenType } from '@masknet/web3-shared-base'
import { skipToken, useQuery } from '@tanstack/react-query'
import { first } from 'lodash-es'
import { memo } from 'react'
import { Icon, type IconProps } from '../Icon/index.js'

import { NetworkIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'relative',
    },
    badgeIcon: {
        position: 'absolute',
        right: -3,
        bottom: -3,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '50%',
    },
}))

export interface TokenIconProps extends IconProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    address?: string
    symbol?: string
    tokenType?: TokenType
    badgeSize?: number
    disableDefaultIcon?: boolean
    disableBadge?: boolean
}

export const TokenIcon = memo(function TokenIcon(props: TokenIconProps) {
    const { classes, cx } = useStyles()
    const {
        pluginID,
        chainId: propChainId,
        address,
        logoURL,
        symbol,
        tokenType = TokenType.Fungible,
        name,
        badgeSize = 16,
        disableDefaultIcon,
        disableBadge,
        className,
        style,
        ...rest
    } = props
    const { pluginID: defaultPluginId } = useEnvironmentContext()
    const { data: token } = useFungibleToken(pluginID, address, undefined, { chainId: propChainId })
    const networks = useNetworks(pluginID)
    const network = networks.find((x) => x.chainId === token?.chainId)

    const { chainId } = useChainContext({ chainId: props.chainId })
    const Hub = useWeb3Hub(pluginID)
    const isNFT = tokenType === TokenType.NonFungible
    const { data } = useQuery({
        queryKey: ['token-icon', chainId, address],
        enabled: !logoURL && !isNFT,
        queryFn:
            address ?
                async () => {
                    const logoURLs = await Hub.getFungibleTokenIconURLs(chainId, address).catch(() => [])
                    return first(logoURLs)
                }
            :   skipToken,
    })

    if (data && disableDefaultIcon) return null
    const text = token?.name || token?.symbol || symbol || name || '?' // `?` prevent to fallback to avatar icon
    const url = logoURL || token?.logoURL || data
    const icon = (
        <Icon
            {...rest}
            logoURL={url}
            name={text}
            style={{ fontSize: typeof rest.size === 'number' ? rest.size / 2 : undefined }}
        />
    )

    return (
        <div className={cx(classes.container, className)} style={{ ...style, height: rest.size, width: rest.size }}>
            {icon}
            {disableBadge ? null : (
                <NetworkIcon
                    pluginID={pluginID ?? defaultPluginId}
                    className={classes.badgeIcon}
                    chainId={chainId}
                    size={badgeSize}
                    network={network}
                />
            )}
        </div>
    )
})
