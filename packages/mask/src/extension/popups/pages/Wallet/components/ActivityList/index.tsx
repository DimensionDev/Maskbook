import urlcat from 'urlcat'
import { memo, useState } from 'react'
import { useAsync } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { useContainer } from 'unstated-next'
import { Button, Link, List } from '@mui/material'
import {
    isSameAddress,
    type RecentTransactionComputed,
    type TransactionDescriptor,
    TransactionDescriptorType,
} from '@masknet/web3-shared-base'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { explorerResolver, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import type { ChainId, Transaction, TransactionParameter } from '@masknet/web3-shared-evm'
import { EMPTY_LIST, PopupRoutes, NetworkPluginID } from '@masknet/shared-base'
import { WalletContext } from '../../hooks/useWalletContext.js'
import { useI18N } from '../../../../../../utils/index.js'
import { ReplaceType } from '../../type.js'
import { ActivityListItem } from './ActivityListItem.js'

const useStyles = makeStyles()({
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
    },
    buttonContainer: {
        padding: 16,
    },
    moreButton: {
        fontWeight: 600,
        fontSize: 14,
        color: '#1C68F3',
        lineHeight: '20px',
        padding: '10px 0',
        borderRadius: 20,
        backgroundColor: '#ffffff',
    },

    empty: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 600,
        color: '#7B8192',
        background: '#F7F9FA',
    },
})

export interface ActivityListProps {
    tokenAddress?: string
}

export const ActivityList = memo<ActivityListProps>(({ tokenAddress }) => {
    const { transactions } = useContainer(WalletContext)
    const { TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { value: dataSource = EMPTY_LIST } = useAsync(async () => {
        if (!TransactionFormatter) return
        const formattedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                const formatterTransaction = await TransactionFormatter.formatTransaction(chainId, transaction._tx)

                return {
                    formatterTransaction,
                    transaction,
                }
            }),
        )

        return formattedTransactions.filter(({ transaction, formatterTransaction }) => {
            if (!tokenAddress) return true
            else if (isNativeTokenAddress(tokenAddress))
                return formatterTransaction.type === TransactionDescriptorType.TRANSFER
            else if (formatterTransaction.type === TransactionDescriptorType.INTERACTION) {
                return isSameAddress(transaction._tx.to, tokenAddress)
            }

            return false
        })
    }, [chainId, tokenAddress, transactions])

    return (
        <ActivityListUI
            dataSource={dataSource}
            chainId={chainId}
            formatterTransactionLink={explorerResolver.transactionLink}
        />
    )
})

export interface ActivityListUIProps {
    dataSource: Array<{
        transaction: RecentTransactionComputed<ChainId, Transaction>
        formatterTransaction: TransactionDescriptor<ChainId, Transaction, TransactionParameter>
    }>
    chainId: ChainId
    formatterTransactionLink?: (chainId: ChainId, id: string) => string
}

export const ActivityListUI = memo<ActivityListUIProps>(({ dataSource, chainId, formatterTransactionLink }) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [isExpand, setExpand] = useState(!(dataSource.length > 3))
    const navigate = useNavigate()
    const { setTransaction } = useContainer(WalletContext)

    if (dataSource.length === 0) return <div className={classes.empty}>{t('popups_wallet_no_transactions')}</div>

    return (
        <>
            <List dense className={classes.list}>
                {dataSource.slice(0, !isExpand ? 3 : undefined).map(({ transaction, formatterTransaction }, index) => {
                    return (
                        <Link
                            href={formatterTransactionLink?.(chainId, transaction.indexId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index}
                            style={{ textDecoration: 'none' }}>
                            <ActivityListItem
                                transaction={transaction}
                                formatterTransaction={formatterTransaction}
                                toAddress={transaction._tx.to}
                                onSpeedUpClick={(e) => {
                                    e.preventDefault()
                                    setTransaction(transaction)
                                    navigate(
                                        urlcat(PopupRoutes.ReplaceTransaction, {
                                            type: ReplaceType.SPEED_UP,
                                        }),
                                    )
                                }}
                                onCancelClick={(e) => {
                                    e.preventDefault()
                                    setTransaction(transaction)
                                    navigate(
                                        urlcat(PopupRoutes.ReplaceTransaction, {
                                            type: ReplaceType.CANCEL,
                                        }),
                                    )
                                }}
                            />
                        </Link>
                    )
                })}
            </List>
            {!isExpand ? (
                <div className={classes.buttonContainer}>
                    <Button fullWidth className={classes.moreButton} onClick={() => setExpand(true)}>
                        {t('more')}
                    </Button>
                </div>
            ) : null}
        </>
    )
})
