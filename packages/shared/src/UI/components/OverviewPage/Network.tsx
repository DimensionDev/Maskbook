import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import { useNetworkContext } from '@masknet/web3-hooks-base'
import { memo, useCallback, useState } from 'react'
import { WalletIcon, useMenuConfig } from '../../../index.js'
import { Button, MenuItem, Stack, Typography, styled } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainRuntime } from '../AssetsManagement/ChainRuntimeProvider.js'

const useStyles = makeStyles()((theme) => ({
    menu: {
        background: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 4px 30px rgba(255, 255, 255, 0.15)'
                : '0px 4px 30px rgba(0, 0, 0, 0.1)',
    },
}))

interface NetworkProps {}
export const Network = memo<NetworkProps>(() => {
    const { classes } = useStyles()
    const { pluginID } = useNetworkContext()
    const [selectedChain, setSelectedChain] = useState<Web3Helper.NetworkDescriptorAll>()
    const { setChainId } = useChainRuntime()
    const networks = getRegisteredWeb3Networks(pluginID).filter((x) => x.isMainnet)

    const onClick = useCallback((chain?: Web3Helper.NetworkDescriptorAll) => {
        setChainId(chain?.chainId)
        setSelectedChain(chain)
        console.log('chain', chain)
    }, [])

    const [menu, openMenu] = useMenuConfig(
        [
            <MenuItem key="all" onClick={() => onClick(undefined)}>
                <NetworkItem />
            </MenuItem>,
            ...(networks
                .filter((x) => x.icon)
                .map((chain) => {
                    return (
                        <MenuItem key={chain.chainId} onClick={() => onClick(chain)}>
                            <NetworkItem chain={chain} />
                        </MenuItem>
                    )
                }) ?? []),
        ],
        {
            classes: { paper: classes.menu },
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'center',
            },
        },
    )

    return (
        <>
            <Button onClick={openMenu}>
                {' '}
                <NetworkItem chain={selectedChain} />
            </Button>
            {menu}
        </>
    )
})

const AllNetworkButton = styled(Typography)(({ theme }) => ({
    display: 'flex',
    padding: 0,
    margin: 0,
    borderRadius: '50%',
    fontSize: 12,
    '&:hover': {
        boxShadow: 'none',
    },
    opacity: 0.5,
    width: 18,
    height: 18,
    justifyContent: 'center',
}))

interface NetworkItemProps {
    chain?: Web3Helper.NetworkDescriptorAll
}
const NetworkItem = memo<NetworkItemProps>(({ chain }) => {
    return (
        <Stack
            display="inline-flex"
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            gap={1}
            width="100%">
            {chain ? (
                <>
                    <WalletIcon mainIcon={chain?.icon} size={18} />
                    <Typography>{chain?.name}</Typography>
                </>
            ) : (
                <>
                    <AllNetworkButton>All</AllNetworkButton>
                    <Typography flex={1}>All network</Typography>
                </>
            )}
        </Stack>
    )
})
