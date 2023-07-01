import { useCopyToClipboard } from 'react-use'
import { Icons } from '@masknet/icons'
import { IconButton, MenuItem, Stack, Typography, type MenuItemProps, Link } from '@mui/material'
import { FormattedAddress, ImageIcon, useSnackbarCallback } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkDescriptor, useWeb3Others } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    contractItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: theme.spacing(4),
        padding: theme.spacing(0.5, 0),
        boxSizing: 'border-box',
        ':not(:last-of-type)': {
            borderBottom: `1px solid ${theme.palette.maskColor.line}`,
        },
    },
    icon: {
        color: theme.palette.maskColor.second,
    },
    address: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
        fontSize: 12,
        fontFamily: 'Helvetica',
        fontWeight: 700,
        minWidth: theme.spacing(11),
    },
    link: {
        display: 'inline-block',
        fontSize: 0,
        marginLeft: theme.spacing(1),
        alignItems: 'center',
    },
}))

interface ContractItemProps extends MenuItemProps {
    pluginID?: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    address: string
    name: string
    symbol?: string
    iconURL?: string
}
export function ContractItem({ pluginID, chainId, address, className, ...rest }: ContractItemProps) {
    const { classes, cx } = useStyles()
    const Others = useWeb3Others(pluginID)
    const [, copyToClipboard] = useCopyToClipboard()

    const networkDescriptor = useNetworkDescriptor(pluginID, chainId)

    const onCopyAddress = useSnackbarCallback(async () => {
        if (!address) return
        copyToClipboard(address)
    }, [address])

    if (!networkDescriptor?.icon) return null

    return (
        <MenuItem className={cx(classes.contractItem, className)} {...rest}>
            <Stack direction="row" alignItems="center">
                <ImageIcon icon={networkDescriptor.icon} size={16} />
                <Typography className={classes.address} ml={1}>
                    <FormattedAddress address={address} size={4} formatter={Others.formatAddress} />
                </Typography>
                <IconButton sx={{ padding: 0 }} color="primary" size="small" onClick={onCopyAddress}>
                    <Icons.PopupCopy size={16} className={classes.icon} />
                </IconButton>
                <Link
                    href={Others.explorerResolver.addressLink(chainId, address)}
                    className={classes.link}
                    target="_blank">
                    <Icons.LinkOut size={16} className={classes.icon} />
                </Link>
            </Stack>
        </MenuItem>
    )
}
