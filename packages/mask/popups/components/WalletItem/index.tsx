import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { formatDomainName, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { NetworkPluginID, ImportSource, type Wallet } from '@masknet/shared-base'
import { useReverseAddress } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'
import {
    Box,
    ListItem,
    Typography,
    type ListItemProps,
    Tooltip,
    Radio,
    listItemSecondaryActionClasses,
} from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { WalletBalance } from '../index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    item: {
        padding: theme.spacing(1),
        display: 'flex',
        cursor: 'pointer',
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 8,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bg,
        },
        [`& .${listItemSecondaryActionClasses.root}`]: {
            right: 0,
        },
    },
    address: {
        fontSize: 12,
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
    },
    mainLine: {
        color: theme.palette.maskColor.main,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
    },
    name: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    text: {
        marginLeft: 6,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 6,
    },
    badge: {
        fontSize: 12,
        fontWeight: 700,
        display: 'inline-block',
        padding: '2px 4px',
        boxSizing: 'border-box',
        borderRadius: 4,
        lineHeight: '16px',
        height: 20,
        backgroundColor: theme.palette.maskColor.bg,
        marginLeft: theme.spacing(1),
        color: theme.palette.maskColor.second,
    },
    balance: {
        textAlign: 'left',
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontSize: 12,
        marginLeft: theme.spacing(2),
    },
    tooltip: {
        width: 240,
    },
}))

interface WalletItemProps extends Omit<ListItemProps, 'onSelect'> {
    wallet: Wallet
    isSelected: boolean
    onSelect(wallet: Wallet): void
    hiddenTag?: boolean
}

export const WalletItem = memo<WalletItemProps>(function WalletItem({
    wallet,
    onSelect,
    isSelected,
    className,
    hiddenTag,
    ...rest
}) {
    const { classes, cx } = useStyles()
    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, wallet.address)

    const handleSelect = useCallback(() => {
        onSelect(wallet)
    }, [wallet])

    const extraName = domain && domain !== wallet.name ? ` (${formatDomainName(domain)})` : ''

    return (
        <ListItem
            className={cx(classes.item, className)}
            onClick={handleSelect}
            secondaryAction={<Radio sx={{ marginLeft: 0.75 }} checked={isSelected} />}
            {...rest}>
            {wallet.owner ?
                <Icons.SmartPay size={24} />
            :   <Icons.MaskBlue size={24} />}
            <Box className={classes.text}>
                <Box width={180} overflow="auto">
                    <Typography className={classes.mainLine} component="div">
                        <Typography className={classes.name}>{`${wallet.name}${extraName}`}</Typography>
                        {wallet.source === ImportSource.LocalGenerated || hiddenTag ? null : (
                            <Typography component="span" className={classes.badge}>
                                <Trans>Imported</Trans>
                            </Typography>
                        )}
                    </Typography>
                    <Typography className={classes.address}>
                        <Tooltip title={wallet.address} placement="right" classes={{ tooltip: classes.tooltip }}>
                            <span>
                                <FormattedAddress address={wallet.address} size={4} formatter={formatEthereumAddress} />
                            </span>
                        </Tooltip>
                    </Typography>
                </Box>
                <WalletBalance className={classes.balance} skeletonWidth={60} account={wallet.address} />
            </Box>
        </ListItem>
    )
})
