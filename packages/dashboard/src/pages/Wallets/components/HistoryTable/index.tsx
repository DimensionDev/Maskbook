import { type Dispatch, memo, type SetStateAction, useMemo, useState } from 'react'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { LoadingBase, makeStyles, MaskColorVar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useTransactions, useNetworkContext, useIterator } from '@masknet/web3-hooks-base'
import { ElementAnchor } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import type { Transaction } from '@masknet/web3-shared-base'
import { HistoryTableRow } from '../HistoryTableRow/index.js'
import { useDashboardI18N } from '../../../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    loading: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        padding: '12px 0 12px',
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
    },
    placeholder: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        rowGap: 14,
    },
    placeholderText: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
}))

interface HistoryTableProps {
    selectedChainId: Web3Helper.ChainIdAll
}

export const HistoryTable = memo<HistoryTableProps>(({ selectedChainId }) => {
    const [page, setPage] = useState(0)
    const { pluginID } = useNetworkContext()
    const iterator = useTransactions(pluginID, { chainId: selectedChainId })
    const {
        value = EMPTY_LIST,
        next,
        done,
        loading,
    } = useIterator<Transaction<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>(iterator)

    const dataSource = useMemo(() => {
        return value.filter((x) => x.chainId === selectedChainId)
    }, [value, selectedChainId])

    return (
        <HistoryTableUI
            page={page}
            onPageChange={setPage}
            done={done}
            isLoading={loading}
            isEmpty={!dataSource.length}
            dataSource={dataSource}
            selectedChainId={selectedChainId}
            next={next}
        />
    )
})

export interface HistoryTableUIProps {
    page: number
    next?: () => void
    onPageChange: Dispatch<SetStateAction<number>>
    done: boolean
    isLoading: boolean
    isEmpty: boolean
    dataSource: Array<Transaction<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    selectedChainId: Web3Helper.ChainIdAll
}

export const HistoryTableUI = memo<HistoryTableUIProps>(({ dataSource, next, isLoading, done, selectedChainId }) => {
    const t = useDashboardI18N()
    const { classes, cx } = useStyles()

    return (
        <>
            {dataSource.length ? (
                <TableContainer className={classes.container}>
                    <Table stickyHeader sx={{ padding: '0 44px' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell key="Types" align="center" variant="head" className={classes.header}>
                                    {t.wallets_history_types()}
                                </TableCell>
                                <TableCell key="Value" align="center" variant="head" className={classes.header}>
                                    {t.wallets_history_value()}
                                </TableCell>
                                <TableCell key="Receiver" align="center" variant="head" className={classes.header}>
                                    {t.wallets_history_receiver()}
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {dataSource.map((transaction) => (
                                <HistoryTableRow
                                    key={transaction.hash}
                                    transaction={transaction}
                                    selectedChainId={selectedChainId}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : isLoading || !done ? (
                <Box className={cx(classes.container, classes.loading)}>
                    <LoadingBase />
                </Box>
            ) : !isLoading && dataSource.length === 0 ? (
                <Box className={classes.placeholder}>
                    <Icons.EmptySimple variant="light" size={36} />
                    <Typography className={classes.placeholderText}>{t.wallet_history_no_data()}</Typography>
                </Box>
            ) : null}
            <ElementAnchor callback={() => next?.()}>
                {!done && dataSource.length ? <LoadingBase /> : null}
            </ElementAnchor>
        </>
    )
})
