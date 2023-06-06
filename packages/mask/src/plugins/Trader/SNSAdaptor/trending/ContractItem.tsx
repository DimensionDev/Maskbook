import { noop } from 'lodash-es'
import { useCopyToClipboard } from 'react-use'
import { Icons } from '@masknet/icons'
import { Divider, IconButton, MenuItem, Stack, Typography } from '@mui/material'
import { FormattedAddress, ImageIcon, useSnackbarCallback } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkDescriptor, useWeb3Others } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    icon: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'centers',
        paddingRight: theme.spacing(2),
    },
    iconColor: {
        color: theme.palette.maskColor.second,
    },
    item: {},
    address: {
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}))

interface ContractItemProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    address: string
    name: string
    symbol?: string
    iconURL?: string
}
export function ContractItem(props: ContractItemProps) {
    const { pluginID, chainId, address } = props
    const { classes } = useStyles()
    const Others = useWeb3Others(pluginID)
    const [, copyToClipboard] = useCopyToClipboard()

    const networkDescriptor = useNetworkDescriptor(pluginID, chainId)

    const onCopyAddress = useSnackbarCallback(async () => {
        if (!address) return
        copyToClipboard(address)
    }, [address])

    if (!networkDescriptor?.icon) return null

    return (
        <>
            <MenuItem className={classes.root}>
                <ImageIcon icon={networkDescriptor.icon} size={20} />
                <Stack className={classes.item}>
                    <Typography fontWeight="700">{networkDescriptor.name}</Typography>
                    <Typography
                        className={classes.address}
                        onClick={
                            chainId ? () => openWindow(Others.explorerResolver.addressLink(chainId, address)) : noop
                        }>
                        <FormattedAddress address={address} size={4} formatter={Others.formatAddress} />
                    </Typography>
                </Stack>
                <Stack className={classes.icon}>
                    <IconButton sx={{ padding: 0 }} color="primary" size="small" onClick={onCopyAddress}>
                        <Icons.PopupCopy size={16} className={classes.iconColor} />
                    </IconButton>
                </Stack>
            </MenuItem>
            <Divider
                sx={{
                    marginLeft: 1,
                    marginRight: '29px',
                }}
            />
        </>
    )
}
