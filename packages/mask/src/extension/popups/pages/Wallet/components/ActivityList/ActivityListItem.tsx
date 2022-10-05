import { memo, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Button, ListItem, ListItemText, Typography } from '@mui/material'
import {
    NetworkPluginID,
    RecentTransactionComputed,
    TransactionDescriptor,
    TransactionDescriptorType,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import type { ChainId, Transaction } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import formatDateTime from 'date-fns/format'
import { useI18N } from '../../../../../../utils/index.js'
import { useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()({
    item: {
        padding: 14,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
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
    transaction: RecentTransactionComputed<ChainId, Transaction>
    formatterTransaction: TransactionDescriptor<ChainId, Transaction>
    onSpeedUpClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    onCancelClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const ActivityListItem = memo<ActivityListItemProps>(
    ({ transaction, toAddress, onSpeedUpClick, onCancelClick, formatterTransaction }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
        const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, toAddress)

        const transactionIcon = useMemo(() => {
            switch (transaction.status) {
                case TransactionStatusType.NOT_DEPEND:
                    return <Icons.Loader color="#FFB915" />
                case TransactionStatusType.SUCCEED:
                    if (
                        formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
                        formatterTransaction.title === 'Transfer Token'
                    )
                        return <Icons.Upload color="#FFB915" />
                    return <Icons.InteractionCircle color="#1C68F3" />
                case TransactionStatusType.FAILED:
                default:
                    return <Icons.CircleClose />
            }
        }, [formatterTransaction])

        if (!formatterTransaction) return null

        return (
            <ListItem className={classes.item}>
                {transactionIcon}
                <ListItemText style={{ marginLeft: 15 }}>
                    <Typography className={classes.description}>{formatterTransaction.description}</Typography>

                    {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                        <Typography fontSize={12} color="#FFB915" fontWeight={600} lineHeight="16px">
                            {t('pending')}
                        </Typography>
                    ) : (
                        <Typography className={classes.secondaryDesc}>
                            {transaction.createdAt ? `${formatDateTime(transaction.createdAt, 'MMM dd')}.  ` : null}
                            {toAddress
                                ? t('popups_wallet_activity_to_address', {
                                      address:
                                          Others?.formatDomainName?.(domain) || Others?.formatAddress(toAddress, 4),
                                  })
                                : null}
                        </Typography>
                    )}

                    {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                        <Box display="flex" mt={1}>
                            {Object.keys(transaction.candidates).length === 1 ? (
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
                <Icons.ArrowRight color="#15181B" size={20} />
            </ListItem>
        )
    },
)
