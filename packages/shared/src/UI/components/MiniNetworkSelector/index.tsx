import { memo } from 'react'
import { Box, Button, Stack, styled } from '@mui/material'
import { ChainId, getChainIdFromNetworkType, NetworkType } from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ChainIcon } from '..'

const AllNetworkButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    marginRight: theme.spacing(1),
    padding: 0,
    lineHeight: '30px',
    width: 30,
    height: 30,
    minWidth: 30,
    borderRadius: '50%',
    fontSize: 12,
    '&:hover': {
        boxShadow: 'none',
    },
    opacity: 0.5,
}))

const useStyles = makeStyles()((theme) => ({
    networkSelected: {
        opacity: 1,
        '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            right: 13,
            display: 'inline-block',
            width: 4,
            height: 4,
            background: MaskColorVar.primary,
            borderRadius: '50%',
        },
    },
    networkDisabled: {
        cursor: 'not-allowed',
        '&:hover': {
            opacity: 0.6,
        },
    },
}))

interface NetworkSelectorMinProps {
    selectedChainId: null | ChainId
    networks: NetworkType[]
    onSelect(chainId: null | ChainId): void
    hideAllNetworkButton?: boolean
    disabledNonCurrentNetwork?: boolean
}

export const MiniNetworkSelector = memo<NetworkSelectorMinProps>(
    ({ hideAllNetworkButton = false, onSelect, selectedChainId, networks = [], disabledNonCurrentNetwork = false }) => {
        const { classes } = useStyles()

        return (
            <Stack direction="row">
                {!hideAllNetworkButton && (
                    <AllNetworkButton
                        className={selectedChainId === null ? classes.networkSelected : ''}
                        onClick={() => onSelect(null)}>
                        ALL
                    </AllNetworkButton>
                )}
                {networks.map((network) => {
                    const chainId = getChainIdFromNetworkType(network)
                    return (
                        <Box
                            key={chainId}
                            position="relative"
                            mr={1}
                            height={30}
                            onClick={() => !disabledNonCurrentNetwork && onSelect(chainId)}
                            sx={{ cursor: 'pointer', opacity: '0.6', ':hover': { opacity: 1 }, userSelect: 'none' }}
                            className={
                                selectedChainId === chainId
                                    ? classes.networkSelected
                                    : disabledNonCurrentNetwork
                                    ? classes.networkDisabled
                                    : ''
                            }>
                            <ChainIcon chainId={chainId} size={30} />
                        </Box>
                    )
                })}
            </Stack>
        )
    },
)
