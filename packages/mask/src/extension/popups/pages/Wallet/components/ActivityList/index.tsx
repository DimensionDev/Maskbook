import urlcat from 'urlcat'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { useContainer } from 'unstated-next'
import { Button, Link, List } from '@mui/material'
import { NetworkPluginID, RecentTransaction } from '@masknet/web3-shared-base'
import type { ChainId, Transaction } from '@masknet/web3-shared-evm'
import { PopupRoutes } from '@masknet/shared-base'
import { WalletContext } from '../../hooks/useWalletContext'
import { useI18N } from '../../../../../../utils'
import { ReplaceType } from '../../type'
import { ActivityListItem } from './ActivityListItem'
import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()({
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
    },
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
    button: {
        fontWeight: 600,
        fontSize: 14,
        color: '#ffffff',
        lineHeight: '20px',
        padding: '3px 0',
        borderRadius: 15,
        backgroundColor: '#1C68F3',
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
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return (
        <ActivityListUI
            dataSource={transactions ?? []}
            chainId={chainId}
            formatterTransactionLink={Others?.explorerResolver.transactionLink}
        />
    )
})

export interface ActivityListUIProps {
    dataSource: Array<RecentTransaction<ChainId, Transaction> & { _tx: Transaction }>
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
                {dataSource.slice(0, !isExpand ? 3 : undefined).map((transaction, index) => {
                    return (
                        <Link
                            href={formatterTransactionLink?.(chainId, transaction.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index}
                            style={{ textDecoration: 'none' }}>
                            <ActivityListItem
                                transaction={transaction}
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
