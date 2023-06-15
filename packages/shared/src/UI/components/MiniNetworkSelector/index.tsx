import { memo } from 'react'
import { Box, Button, Stack, styled } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ChainIcon } from '../ChainIcon/index.js'
import { WalletIcon } from '../WalletIcon/index.js'

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

const useStyles = makeStyles<{
    size: number
}>()((theme, props) => ({
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
}))

export interface NetworkSelectorMinProps {
    selectedNetwork: {
        ID: string
        chainId: number
    } | null
    networks: Array<{
        ID: string
        isMainnet: boolean
        chainId: number
        icon: URL
        iconColor: string
    }>
    onSelect(
        network: {
            chainId: number
        } | null,
    ): void
    hideAllNetworkButton?: boolean
    size?: number
}

export const MiniNetworkSelector = memo<NetworkSelectorMinProps>(
    ({ hideAllNetworkButton = false, onSelect, networks = [], selectedNetwork, size = 30 }) => {
        const { classes } = useStyles({ size })

        return (
            <Stack direction="row">
                {!hideAllNetworkButton && (
                    <AllNetworkButton
                        className={!selectedNetwork ? classes.networkSelected : ''}
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
                {networks
                    .filter((x) => x.isMainnet)
                    .map((network) => {
                        return (
                            <Box
                                key={network.ID}
                                position="relative"
                                mr={1}
                                height={size}
                                onClick={() => onSelect(network)}
                                sx={{
                                    cursor: 'pointer',
                                    opacity: '0.6',
                                    ':hover': { opacity: 1 },
                                    userSelect: 'none',
                                    lineHeight: `${size}px`,
                                }}
                                className={selectedNetwork?.ID === network.ID ? classes.networkSelected : ''}>
                                {network.isMainnet ? (
                                    <WalletIcon mainIcon={network.icon} size={size} />
                                ) : (
                                    <ChainIcon color={network.iconColor} size={size} />
                                )}
                            </Box>
                        )
                    })}
            </Stack>
        )
    },
)
