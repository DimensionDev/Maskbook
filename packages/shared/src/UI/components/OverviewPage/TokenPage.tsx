import { memo } from 'react'
import { useChainRuntime } from '../AssetsManagement/ChainRuntimeProvider.js'
import { FungibleTokenTable } from './Asset/TokensPage.js'
import type { ChartStat } from './types.js'
import { Chart } from './Chart.js'
import { Button, Typography } from '@mui/material'
import { useContainer } from 'unstated-next'
import { Context } from './hooks/useAssets.js'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { TokenType, type NonFungibleAsset, type Transaction } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useBlockie,
    useChainIdValid,
    useFungibleAsset,
    useNetworkDescriptor,
    useNonFungibleAsset,
} from '@masknet/web3-hooks-base'
import { WalletIcon } from '../WalletIcon/index.js'
import formatDateTime from 'date-fns/format'
import { DebankTransactionDirection, ZerionTransactionDirection } from '@masknet/web3-providers/types'
import { BigNumber } from 'bignumber.js'

const useStyles = makeStyles()((theme) => ({
    chartBar: {
        display: 'grid',
        flexDirection: 'row',
        gap: 30,
        gridTemplateColumns: '1fr 350px',
        gridAutoFlow: 'column',
    },
    row: {
        gap: 8,
        display: 'flex',
        flexDirection: 'row',
        margin: 8,
        alignItems: 'center',
    },
    seeMore: {
        paddingTop: 16,
        paddingBottom: 16,
        borderTop: `1px solid ${theme.palette.maskColor.line}`,
        justifyContent: 'center',
        display: 'flex',
    },
    history: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 12,
        maxHeight: 350,
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
    },

    loading: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    historyRecord: {
        flex: 1,
    },
    amount: {
        flex: 1,
        display: 'flex',
        justifyContent: 'end',
    },
}))
interface TokenPageProps {
    seeMore: () => void
}

export const TokenPage = memo<TokenPageProps>(({ seeMore }) => {
    const { classes } = useStyles()
    const { chainId } = useChainRuntime()
    const stat: ChartStat[] = [
        [1691071891847, 10],
        [1691071991847, 100],
        [1691072891847, 1000],
    ]

    return (
        <div>
            <div className={classes.chartBar}>
                <div>
                    <Typography>Performance</Typography>
                    <div style={{ border: '1px solid gray' }}>
                        <Chart stats={stat} />
                    </div>
                </div>
                <div>
                    <Typography>History</Typography>
                    <History seeMore={seeMore} />
                </div>
            </div>
            <div>
                <Typography fontWeight={700} component="h1">
                    Assets
                </Typography>
                <FungibleTokenTable selectedChainId={chainId} />
            </div>
        </div>
    )
})

interface HistoryProps {
    seeMore: () => void
}
const History = memo<HistoryProps>(({ seeMore }) => {
    const { classes } = useStyles()
    const {
        history: { value: dataSource, loading },
        chainId,
    } = useContainer(Context)

    return (
        <div className={classes.history}>
            {loading ? (
                <div className={classes.loading}>
                    <LoadingBase />
                </div>
            ) : (
                <div className={classes.historyRecord}>
                    {dataSource.slice(0, 5).map((transaction) => (
                        <div key={transaction.timestamp}>
                            {transaction.assets[0].type === TokenType.NonFungible ? (
                                <HistoryNonFungibleRow transaction={transaction} />
                            ) : null}
                            {transaction.assets[0].type === TokenType.Fungible ? (
                                <HistoryFungibleRow transaction={transaction} />
                            ) : null}
                        </div>
                    ))}
                    <div className={classes.seeMore}>
                        <Button onClick={seeMore} disabled={loading}>
                            See more
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
})

interface HistoryNonFungibleRowProps {
    transaction: Transaction<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

const HistoryNonFungibleRow = memo<HistoryNonFungibleRowProps>(({ transaction }) => {
    const { pluginID, chainId, account } = useChainRuntime()
    const { data: asset } = useNonFungibleAsset(pluginID, transaction.assets[0].address, transaction.assets[0].id, {
        chainId,
    })
    console.log('---nonfungbile----')
    console.log('tranaction', transaction)
    console.log('asset', asset)
    return <HistoryRow asset={asset} transaction={transaction} />
})

interface HistoryFungibleRowProps {
    transaction: Transaction<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

const HistoryFungibleRow = memo<HistoryFungibleRowProps>(({ transaction }) => {
    const { pluginID, chainId, account } = useChainRuntime()
    const { data: asset } = useFungibleAsset(pluginID, transaction.assets[0].address, {
        chainId,
        account,
    })
    console.log('----fungible---')
    console.log('tranaction', transaction)
    console.log('asset', asset)
    return <HistoryRow asset={asset} transaction={transaction} />
})

interface HistoryRowProps {
    asset?:
        | Web3Helper.FungibleAssetScope<'all'>
        | NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        | null
    transaction: Transaction<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

const HistoryRow = memo<HistoryRowProps>(({ asset, transaction }) => {
    const { classes } = useStyles()
    const networkDescriptor = useNetworkDescriptor(undefined, transaction.chainId)
    const chainIdValid = useChainIdValid(undefined, transaction.chainId)
    const icon = useBlockie(transaction.assets[0].address)
    const direction =
        transaction.assets[0].direction === DebankTransactionDirection.SEND ||
        transaction.assets[0].direction === ZerionTransactionDirection.OUT
    const amount = transaction.assets[0].amount
    return (
        <div className={classes.row}>
            <WalletIcon
                size={20}
                badgeSize={12}
                mainIcon={icon}
                badgeIcon={chainIdValid ? networkDescriptor?.icon : undefined}
            />
            <div>
                <Typography color="textPrimary">{transaction.cateName}</Typography>
                <Typography color="textSecondary">{formatDateTime(transaction.timestamp, 'MM-dd')}</Typography>
            </div>
            <div className={classes.amount}>
                <span>{direction ? '-' : '+'}</span>
                <span>{new BigNumber(amount).toFixed(new BigNumber(amount).toNumber() < 1 ? 6 : 2)}</span>
            </div>
        </div>
    )
})
