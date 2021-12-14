import urlcat from 'urlcat'
import type { TransactionReceipt } from 'web3-core'
import { memo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { useContainer } from 'unstated-next'
import { Button, Link, List } from '@mui/material'
import {
    ChainId,
    EthereumRpcType,
    isNative,
    isSameAddress,
    resolveTransactionLinkOnExplorer,
    useChainId,
} from '@masknet/web3-shared-evm'
import { PopupRoutes } from '@masknet/shared-base'
import { WalletContext } from '../../hooks/useWalletContext'
import type { RecentTransaction } from '../../../../../../plugins/Wallet/services'
import type Services from '../../../../../service'
import { useI18N } from '../../../../../../utils'
import { ReplaceType } from '../../type'
import { ActivityListItem } from './ActivityListItem'

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

    const dataSource =
        transactions?.filter((transaction) => {
            if (!tokenAddress) return true
            else if (isNative(tokenAddress)) return transaction.computedPayload?.type === EthereumRpcType.SEND_ETHER
            else if (
                transaction.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION &&
                (transaction.computedPayload?.name === 'transfer' ||
                    transaction.computedPayload?.name === 'transferFrom')
            ) {
                return isSameAddress(transaction.computedPayload?._tx?.to, tokenAddress)
            }
            return false
        }) ?? []

    const chainId = useChainId()
    return <ActivityListUI dataSource={dataSource} chainId={chainId} />
})

export interface ActivityListUIProps {
    dataSource: RecentTransaction[]
    chainId: ChainId
}

export const ActivityListUI = memo<ActivityListUIProps>(({ dataSource, chainId }) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [isExpand, setExpand] = useState(!(dataSource.length > 3))
    const history = useHistory()
    const { setTransaction } = useContainer(WalletContext)

    if (dataSource.length === 0) return <div className={classes.empty}>{t('popups_wallet_no_transactions')}</div>

    return (
        <>
            <List dense className={classes.list}>
                {dataSource.slice(0, !isExpand ? 3 : undefined).map((transaction, index) => {
                    const toAddress = getToAddress(transaction.receipt, transaction.computedPayload)
                    return (
                        <Link
                            href={resolveTransactionLinkOnExplorer(
                                chainId,
                                transaction.receipt?.transactionHash ?? transaction.hash,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index}
                            style={{ textDecoration: 'none' }}>
                            <ActivityListItem
                                transaction={transaction}
                                toAddress={toAddress}
                                onSpeedUpClick={(e) => {
                                    e.preventDefault()
                                    setTransaction(transaction)
                                    history.push(
                                        urlcat(PopupRoutes.ReplaceTransaction, {
                                            type: ReplaceType.SPEED_UP,
                                        }),
                                    )
                                }}
                                onCancelClick={(e) => {
                                    e.preventDefault()
                                    setTransaction(transaction)
                                    history.push(
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

function getToAddress(
    receipt?: TransactionReceipt | null,
    computedPayload?: UnboxPromise<ReturnType<typeof Services.Ethereum.getSendTransactionComputedPayload>> | null,
) {
    if (!computedPayload) return undefined
    const type = computedPayload.type
    switch (type) {
        case EthereumRpcType.SEND_ETHER:
            return receipt?.to
        case EthereumRpcType.CONTRACT_INTERACTION:
            switch (computedPayload.name) {
                case 'transfer':
                case 'transferFrom':
                    return computedPayload.parameters?.to
                case 'approve':
                default:
                    return receipt?.to
            }
        case EthereumRpcType.CONTRACT_DEPLOYMENT:
            return receipt?.to
        case EthereumRpcType.CANCEL:
        case EthereumRpcType.RETRY:
        default:
            return undefined
    }
}
