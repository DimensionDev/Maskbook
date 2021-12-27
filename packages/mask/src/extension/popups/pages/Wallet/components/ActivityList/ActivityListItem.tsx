import type { RecentTransaction } from '../../../../../../plugins/Wallet/services'
import { makeStyles } from '@masknet/theme'
import React, { memo } from 'react'
import { Box, Button, ListItem, ListItemText, Typography } from '@mui/material'
import { formatEthereumAddress, TransactionStatusType } from '../../../../../../../../web3-shared/evm'
import { ArrowRightIcon, CircleCloseIcon, InteractionCircleIcon, LoaderIcon } from '@masknet/icons'
import { RecentTransactionDescription } from '../../../../../../plugins/Wallet/SNSAdaptor/WalletStatusDialog/TransactionDescription'
import formatDateTime from 'date-fns/format'
import { useI18N } from '../../../../../../utils'
import { NetworkPluginID, useReverseAddress, useWeb3State } from '@masknet/plugin-infra'

const useStyles = makeStyles()({
    item: {
        padding: 14,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
    },
    arrow: {
        stroke: '#15181B',
        fill: 'none',
        fontSize: 20,
    },
    icon: {
        width: 20,
        height: 20,
    },
    loader: {
        fill: '#FFB915',
    },
    interaction: {
        stroke: '#1C68F3',
        fill: 'none',
    },
    description: {
        color: '#000000',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 600,
    },
    secondaryDesc: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 600,
        marginTop: 2,
    },
    button: {
        fontWeight: 600,
        fontSize: 14,
        color: '#ffffff',
        lineHeight: '20px',
        padding: '3px 0',
        borderRadius: 15,
        backgroundColor: '#1C68F3',
    },
})

export interface ActivityListItemProps {
    toAddress?: string
    transaction: RecentTransaction
    onSpeedUpClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    onCancelClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const ActivityListItem = memo<ActivityListItemProps>(
    ({ transaction, toAddress, onSpeedUpClick, onCancelClick }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const { Utils } = useWeb3State()
        const { value: domain } = useReverseAddress(toAddress, NetworkPluginID.PLUGIN_EVM)

        return (
            <ListItem className={classes.item}>
                {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                    <LoaderIcon className={classes.loader} />
                ) : transaction.status === TransactionStatusType.SUCCEED ||
                  transaction.status === TransactionStatusType.CANCELLED ? (
                    <InteractionCircleIcon className={classes.interaction} />
                ) : (
                    <CircleCloseIcon style={{ fill: 'none' }} />
                )}
                <ListItemText style={{ marginLeft: 15 }}>
                    <Typography className={classes.description}>
                        <RecentTransactionDescription {...transaction} />
                    </Typography>

                    {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                        <Typography fontSize={12} color="#FFB915" fontWeight={600} lineHeight="16px">
                            {t('pending')}
                        </Typography>
                    ) : (
                        <Typography className={classes.secondaryDesc}>
                            {transaction.at ? `${formatDateTime(transaction.at, 'MMM dd')}.  ` : null}
                            {!!toAddress
                                ? t('popups_wallet_activity_to_address', {
                                      address: Utils?.formatDomainName?.(domain) || formatEthereumAddress(toAddress, 4),
                                  })
                                : null}
                        </Typography>
                    )}

                    {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                        <Box display="flex" mt={1}>
                            {!transaction.payloadReplacement ? (
                                <Button className={classes.button} variant="contained" onClick={onSpeedUpClick}>
                                    {t('speed_up')}
                                </Button>
                            ) : null}
                            <Button
                                className={classes.button}
                                style={{ color: '#1C68F3', backgroundColor: '#F7F9FA', marginLeft: 2 }}
                                onClick={onCancelClick}>
                                {t('cancel')}
                            </Button>
                        </Box>
                    ) : null}

                    {transaction.status === TransactionStatusType.FAILED ? (
                        <Typography fontSize={12} color="#FF5F5F" fontWeight={600} lineHeight="16px">
                            {t('failed')}
                        </Typography>
                    ) : null}
                </ListItemText>
                <ArrowRightIcon className={classes.arrow} style={{ fill: 'none' }} />
            </ListItem>
        )
    },
)
