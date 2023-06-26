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
    domain: {
        marginLeft: 4,
    },
    name: {
        color: theme.palette.primary.main,
        fontWeight: 500,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text: {
        marginLeft: 6,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
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
        backgroundColor: alpha(theme.palette.maskColor.primary, 0.18),
        marginLeft: theme.spacing(1),
        color: theme.palette.maskColor.highlight,
    },
    balance: {
        textAlign: 'left',
        color: theme.palette.maskColor.second,
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
        flexGrow: 1,
        width: '50%',
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
                <Box width="50%">
                    <Typography className={classes.name}>
                        <Typography component="span" display="flex" alignItems="center">
                            {wallet.name}
                            {domain ? (
                                <Typography component="span" className={classes.domain}>
                                    ({formatDomainName(domain)})
                                </Typography>
                            ) : null}
                            {wallet.hasDerivationPath ? null : (
                                <Typography component="span" className={classes.badge}>
                                    {t('wallet_imported')}
                                </Typography>
                            )}
                        </Typography>
                    </Typography>
                    <Typography className={classes.address}>
                        <Tooltip title={wallet.address} placement="right">
                            <span>
                                <FormattedAddress address={wallet.address} size={4} formatter={formatEthereumAddress} />
                            </span>
                        </Tooltip>
                    </Typography>
                </Box>
                <WalletBalance className={classes.balance} skeletonWidth={100} account={wallet.address} />
            </Box>
        </ListItem>
    )
})
