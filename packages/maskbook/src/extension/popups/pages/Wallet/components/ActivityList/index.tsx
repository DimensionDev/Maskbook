import { memo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../../hooks/useWalletContext'
import { Button, Link, List, ListItem, ListItemText, Typography } from '@mui/material'
import {
    ChainId,
    EthereumRpcType,
    formatEthereumAddress,
    isNative,
    isSameAddress,
    resolveTransactionLinkOnExplorer,
    TransactionStatusType,
    useChainId,
} from '@masknet/web3-shared-evm'
import formatDateTime from 'date-fns/format'
import { ArrowRightIcon, CircleCloseIcon, InteractionCircleIcon, LoaderIcon } from '@masknet/icons'
import { RecentTransactionDescription } from '../../../../../../plugins/Wallet/SNSAdaptor/WalletStatusDialog/TransactionDescription'
import type { RecentTransaction } from '../../../../../../plugins/Wallet/services'
import type Services from '../../../../../service'
import type { TransactionReceipt } from 'web3-core'
import { useI18N } from '../../../../../../utils'

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
    button: {
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
    const [isExpand, setIsExpand] = useState(!(dataSource.length > 3))

    if (dataSource.length === 0) return <div className={classes.empty}>{t('popups_wallet_no_transactions')}</div>

    return (
        <>
            <List dense className={classes.list}>
                {dataSource.slice(0, !isExpand ? 3 : undefined).map((transaction, index) => {
                    const toAddress = getToAddress(transaction.receipt, transaction.computedPayload)
                    return (
                        <Link
                            href={resolveTransactionLinkOnExplorer(chainId, transaction.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index}
                            style={{ textDecoration: 'none' }}>
                            <ListItem className={classes.item}>
                                {transaction.status === TransactionStatusType.NOT_DEPEND ? (
                                    <LoaderIcon className={classes.loader} />
                                ) : transaction.status === TransactionStatusType.SUCCEED ? (
                                    <InteractionCircleIcon className={classes.interaction} />
                                ) : (
                                    <CircleCloseIcon style={{ fill: 'none' }} />
                                )}
                                <ListItemText style={{ marginLeft: 15 }}>
                                    <Typography className={classes.description}>
                                        <RecentTransactionDescription {...transaction} />
                                    </Typography>

                                    <Typography className={classes.secondaryDesc}>
                                        {transaction.at ? `${formatDateTime(transaction.at, 'MMM dd')}.  ` : null}
                                        {!!toAddress
                                            ? t('popups_wallet_activity_to_address', {
                                                  address: formatEthereumAddress(toAddress, 4),
                                              })
                                            : null}
                                    </Typography>

                                    {transaction.status === TransactionStatusType.FAILED ? (
                                        <Typography>Failed</Typography>
                                    ) : null}
                                </ListItemText>
                                <ArrowRightIcon className={classes.arrow} style={{ fill: 'none' }} />
                            </ListItem>
                        </Link>
                    )
                })}
            </List>
            {!isExpand ? (
                <div className={classes.buttonContainer}>
                    <Button fullWidth className={classes.button} onClick={() => setIsExpand(true)}>
                        More
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
