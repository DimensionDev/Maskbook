import { memo, useCallback } from 'react'
import { Box, MenuItem, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { Flags } from '../../../../utils'
import {
    ChainId,
    getChainIdFromNetworkType,
    getChainName,
    getChainShortName,
    NetworkType,
    ProviderType,
    resolveNetworkName,
} from '@masknet/web3-shared'
import { currentChainIdSettings } from '../../../../plugins/Wallet/settings'
import { useMenu, useValueRef } from '@masknet/shared'
import { ArrowDownRound } from '@masknet/icons'
import { getEnumAsArray } from '@dimensiondev/kit'
import { ChainIcon } from '../ChainIcon'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../../plugins/Wallet/messages'

const useStyles = makeStyles()((theme) => ({
    root: {
        minWidth: 140,
        backgroundColor: theme.palette.primary.main,
        padding: '4px 12px 4px 4px',
        minHeight: 28,
        borderRadius: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconWrapper: {
        width: 20,
        height: 20,
        borderRadius: 20,
        marginRight: 10,
    },
    title: {
        color: '#ffffff',
        fontSize: 12,
        lineHeight: '16px',
    },
    arrow: {
        stroke: '#ffffff',
        fontSize: 16,
    },
    networkName: {
        marginLeft: 10,
    },
}))

export const NetworkSelector = memo(() => {
    const currentChainId = useValueRef(currentChainIdSettings)
    const { value: networks } = useAsync(async () => WalletRPC.getSupportedNetworks(), [])
    const onChainChange = useCallback((chainId: ChainId) => {
        WalletRPC.updateAccount({
            chainId,
            providerType: ProviderType.Maskbook,
        })
    }, [])

    return <NetworkSelectorUI currentChainId={currentChainId} onChainChange={onChainChange} networks={networks} />
})

export interface NetworkSelectorUIProps {
    currentChainId: ChainId
    onChainChange: (chainId: ChainId) => void
    networks?: NetworkType[]
}

export const NetworkSelectorUI = memo<NetworkSelectorUIProps>(({ currentChainId, onChainChange, networks }) => {
    const { classes } = useStyles()
    const [menu, openMenu] = useMenu(
        ...((Flags.support_eth_network_switch
            ? getEnumAsArray(ChainId).map(({ value: chainId }) => {
                  return (
                      <MenuItem key={chainId} onClick={() => onChainChange(chainId)}>
                          <ChainIcon chainId={chainId} />
                          <Typography className={classes.networkName}>{getChainName(chainId)}</Typography>
                      </MenuItem>
                  )
              })
            : networks?.map((network) => {
                  const chainId = getChainIdFromNetworkType(network)

                  return (
                      <MenuItem key={network} onClick={() => onChainChange(chainId)}>
                          <ChainIcon chainId={chainId} />
                          <Typography>{resolveNetworkName(network)}</Typography>
                      </MenuItem>
                  )
              })) ?? []),
    )

    return (
        <>
            <Box className={classes.root} onClick={openMenu}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className={classes.iconWrapper}>
                        <ChainIcon chainId={currentChainId} />
                    </div>
                    <Typography className={classes.title}>{getChainShortName(currentChainId).toUpperCase()}</Typography>
                </div>
                <ArrowDownRound className={classes.arrow} />
            </Box>
            {menu}
        </>
    )
})
