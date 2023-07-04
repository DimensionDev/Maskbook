import { memo, useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { formatDomainName, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { NetworkPluginID, type Wallet } from '@masknet/shared-base'
import { useReverseAddress } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, alpha, type ListItemProps, Tooltip } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { WalletBalance } from '../../../components/index.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'

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
    },
    address: {
        fontSize: 12,
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
    },
    mainLine: {
        color: theme.palette.primary.main,
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
        fontFamily: 'Helvetica',
        fontWeight: 700,
        display: 'inline-block',
        padding: '2px 4px',
        boxSizing: 'border-box',
        borderRadius: 4,
        lineHeight: '16px',
        height: 20,
        backgroundColor: alpha(theme.palette.maskColor.primary, 0.1),
        marginLeft: theme.spacing(1),
        color: theme.palette.maskColor.highlight,
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
}))

export interface WalletItemProps extends Omit<ListItemProps, 'onSelect'> {
    wallet: Wallet
    isSelected: boolean
    onSelect(wallet: Wallet): void
}

export const WalletItem = memo<WalletItemProps>(function WalletItem({
    wallet,
    onSelect,
    isSelected,
    className,
    ...rest
}) {
    const { classes, cx, theme } = useStyles()
    const { t } = useI18N()
    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, wallet.address)

    const handleSelect = useCallback(() => {
        onSelect(wallet)
    }, [wallet])

    return (
        <ListItem
            className={cx(classes.item, className)}
            onClick={handleSelect}
            secondaryAction={
                isSelected ? (
                    <Icons.RadioButtonChecked size={20} />
                ) : (
                    <Icons.RadioButtonUnChecked size={20} color={theme.palette.maskColor.line} />
                )
            }
            {...rest}>
            {wallet.owner ? <Icons.SmartPay size={24} /> : <Icons.MaskBlue size={24} />}
            <Box className={classes.text}>
                <Box width={180} overflow="auto">
                    <Typography className={classes.mainLine} component="div">
                        <Typography className={classes.name}>
                            {`${wallet.name}${domain ? ` (${formatDomainName(domain)})` : ''}`}
                        </Typography>
                        {wallet.hasDerivationPath ? null : (
                            <Typography component="span" className={classes.badge}>
                                {t('wallet_imported')}
                            </Typography>
                        )}
                    </Typography>
                    <Typography className={classes.address}>
                        <Tooltip title={wallet.address} placement="right">
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
