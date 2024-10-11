import { NetworkIcon, TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { OKX } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Box, type BoxProps } from '@mui/material'
import { skipToken, useQuery } from '@tanstack/react-query'
import { memo } from 'react'

const useStyles = makeStyles()(() => ({
    icon: {
        position: 'relative',
    },
    badgeIcon: {
        position: 'absolute',
        right: -3,
        bottom: -2,
    },
}))

export interface CoinIconProps extends BoxProps {
    chainId?: ChainId
    address?: string
    token?: Web3Helper.FungibleTokenAll
    tokenIconSize?: number
    chainIconSize?: number
    disableBadge?: boolean
}

export const CoinIcon = memo<CoinIconProps>(function CoinIcon({
    chainId,
    address,
    tokenIconSize = 30,
    chainIconSize = 12,
    disableBadge,
    ...rest
}) {
    const { classes, cx } = useStyles()

    const { data: logoURL } = useQuery({
        queryKey: ['okx-tokens', chainId],
        queryFn: chainId ? () => OKX.getTokens(chainId) : skipToken,
        select(tokens) {
            return tokens?.find((x) => isSameAddress(x.address, address))?.logoURL
        },
    })
    return (
        <Box className={cx(classes.icon, rest.className)}>
            <TokenIcon chainId={chainId} address={address || ''} size={tokenIconSize} logoURL={logoURL} />
            {chainId && !disableBadge ?
                <NetworkIcon
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    className={classes.badgeIcon}
                    chainId={chainId}
                    size={chainIconSize}
                />
            :   null}
        </Box>
    )
})
