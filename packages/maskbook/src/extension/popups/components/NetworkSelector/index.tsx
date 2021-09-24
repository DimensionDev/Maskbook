import { memo, useCallback } from 'react'
import { Box, MenuItem, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { Flags } from '../../../../utils'
import {
    ChainId,
    getChainIdFromNetworkType,
    getChainName,
    getNetworkName,
    getNetworkTypeFromChainId,
    NetworkType,
    ProviderType,
    resolveNetworkName,
    useAccount,
} from '@masknet/web3-shared'
import {
    currentMaskWalletChainIdSettings,
    currentMaskWalletNetworkSettings,
    currentProviderSettings,
} from '../../../../plugins/Wallet/settings'
import { ChainIcon, useMenu, useValueRef } from '@masknet/shared'
import { ArrowDownRound } from '@masknet/icons'
import { getEnumAsArray } from '@dimensiondev/kit'
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
    const account = useAccount()
    const currentChainId = useValueRef(currentMaskWalletChainIdSettings)
    const currentProvider = useValueRef(currentProviderSettings)
    const { value: networks } = useAsync(async () => WalletRPC.getSupportedNetworks(), [])
    const onChainChange = useCallback(
        async (chainId: ChainId) => {
            if (currentProvider === ProviderType.MaskWallet) {
                return WalletRPC.updateAccount({
                    chainId,
                    account,
                    providerType: currentProvider,
                })
            } else {
                currentMaskWalletChainIdSettings.value = chainId
                const networkType = getNetworkTypeFromChainId(chainId)

                if (networkType) {
                    currentMaskWalletNetworkSettings.value = networkType
                }
            }
        },
        [currentProvider, account],
    )

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
                      <MenuItem
                          key={chainId}
                          onClick={() => onChainChange(chainId)}
                          selected={chainId === currentChainId}>
                          <ChainIcon chainId={chainId} />
                          <Typography className={classes.networkName}>{getChainName(chainId)}</Typography>
                      </MenuItem>
                  )
              })
            : networks?.map((network) => {
                  const chainId = getChainIdFromNetworkType(network)

                  return (
                      <MenuItem
                          key={network}
                          onClick={() => onChainChange(chainId)}
                          selected={chainId === currentChainId}>
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
                    <Typography className={classes.title}>{getNetworkName(currentChainId)}</Typography>
                </div>
                <ArrowDownRound className={classes.arrow} />
            </Box>
            {menu}
        </>
    )
})
