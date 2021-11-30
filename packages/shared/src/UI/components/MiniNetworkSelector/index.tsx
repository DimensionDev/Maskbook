import { memo } from 'react'
import { Box, Button, Stack, styled } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { ChainIcon } from '../ChainIcon'
import { WalletIcon } from '../WalletIcon'

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
    selectedNetwork: {
        ID: string
        chainId: number
    } | null
    networks: {
        ID: string
        isMainnet: boolean
        chainId: number
        icon: URL
        iconColor: string
    }[]
    onSelect(network: { chainId: number } | null): void
    hideAllNetworkButton?: boolean
    disabledNonCurrentNetwork?: boolean
    size?: number
}

export const MiniNetworkSelector = memo<NetworkSelectorMinProps>(
    ({
        hideAllNetworkButton = false,
        onSelect,
        networks = [],
        selectedNetwork,
        disabledNonCurrentNetwork = false,
        size = 30,
    }) => {
        const { classes } = useStyles({ size: size })

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
                                onClick={() => !disabledNonCurrentNetwork && onSelect(network)}
                                sx={{
                                    cursor: 'pointer',
                                    opacity: '0.6',
                                    ':hover': { opacity: 1 },
                                    userSelect: 'none',
                                    lineHeight: `${size}px`,
                                }}
                                className={
                                    selectedNetwork?.ID === network.ID
                                        ? classes.networkSelected
                                        : disabledNonCurrentNetwork
                                        ? classes.networkDisabled
                                        : ''
                                }>
                                {network.isMainnet ? (
                                    <WalletIcon networkIcon={network.icon} size={size} />
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
