import { memo } from 'react'
import { Box, Button, Stack, styled } from '@mui/material'
import { ChainId, getChainIdFromNetworkType, NetworkType } from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { WalletIcon } from '..'

const AllNetworkButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    marginRight: theme.spacing(1),
    padding: 0,
    borderRadius: '50%',
    fontSize: 12,
    '&:hover': {
        boxShadow: 'none',
    },
    opacity: 0.5,
}))

const useStyles = makeStyles<{ size: number }>()((theme, props) => ({
    networkSelected: {
        opacity: 1,
        '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            right: (props.size - 4) / 2,
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

export interface NetworkSelectorMinProps {
    selectedChainId: null | ChainId
    networks: { ID: string; icon: URL; type: NetworkType }[]
    onSelect(chainId: null | ChainId): void
    hideAllNetworkButton?: boolean
    disabledNonCurrentNetwork?: boolean
    size?: number
}

export const MiniNetworkSelector = memo<NetworkSelectorMinProps>(
    ({
        hideAllNetworkButton = false,
        onSelect,
        selectedChainId,
        networks = [],
        disabledNonCurrentNetwork = false,
        size = 30,
    }) => {
        const { classes } = useStyles({ size: size })

        return (
            <Stack direction="row">
                {!hideAllNetworkButton && (
                    <AllNetworkButton
                        className={selectedChainId === null ? classes.networkSelected : ''}
                        sx={{
                            width: size,
                            height: size,
                            minWidth: size,
                            lineHeight: `${size}px`,
                        }}
                        onClick={() => onSelect(null)}>
                        ALL
                    </AllNetworkButton>
                )}
                {networks.map((network) => {
                    const chainId = getChainIdFromNetworkType(network.type)
                    return (
                        <Box
                            key={network.ID}
                            position="relative"
                            mr={1}
                            height={size}
                            onClick={() => !disabledNonCurrentNetwork && onSelect(chainId)}
                            sx={{
                                cursor: 'pointer',
                                opacity: '0.6',
                                ':hover': { opacity: 1 },
                                userSelect: 'none',
                                lineHeight: `${size}px`,
                            }}
                            className={
                                selectedChainId === chainId
                                    ? classes.networkSelected
                                    : disabledNonCurrentNetwork
                                    ? classes.networkDisabled
                                    : ''
                            }>
                            <WalletIcon size={size} networkIcon={network.icon} />
                        </Box>
                    )
                })}
            </Stack>
        )
    },
)
