import { Icons } from '@masknet/icons'
import { MenuItem, Stack, Typography, type MenuItemProps, Link } from '@mui/material'
import { CopyButton, FormattedAddress, ImageIcon } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkDescriptor, useWeb3Utils } from '@masknet/web3-hooks-base'

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
    const Utils = useWeb3Utils(pluginID)

    const networkDescriptor = useNetworkDescriptor(pluginID, chainId)

    if (!networkDescriptor?.icon) return null

    return (
        <MenuItem className={cx(classes.contractItem, className)} {...rest}>
            <Stack direction="row" alignItems="center">
                <ImageIcon icon={networkDescriptor.icon} size={16} />
                <Typography className={classes.address} ml={1}>
                    <FormattedAddress address={address} size={4} formatter={Utils.formatAddress} />
                </Typography>
                <CopyButton className={classes.icon} text={address} size={16} title="Copy address" scoped={false} />
                <Link
                    href={Utils.explorerResolver.addressLink(chainId, address)}
                    className={classes.link}
                    target="_blank">
                    <Icons.LinkOut size={16} className={classes.icon} />
                </Link>
            </Stack>
        </MenuItem>
    )
}
