import { noop } from 'lodash-es'
import { Dispatch, memo, SetStateAction, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useTransactions, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Transaction } from '@masknet/web3-shared-base'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder/index.js'
import { EmptyPlaceholder } from '../EmptyPlaceholder/index.js'
import { HistoryTableRow } from '../HistoryTableRow/index.js'
import { useDashboardI18N } from '../../../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular as any,
        padding: '12px 0 12px',
        border: 'none',
        backgroundColor: MaskColorVar.primaryBackground,
    },
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

interface HistoryTableProps {
    selectedChainId: Web3Helper.ChainIdAll
}

export const HistoryTable = memo<HistoryTableProps>(({ selectedChainId }) => {
    const [page, setPage] = useState(0)
    const { pluginID } = useNetworkContext()
    const { account } = useChainContext()
    const { value = EMPTY_LIST, loading } = useTransactions(pluginID, { chainId: selectedChainId })

    useUpdateEffect(() => {
        setPage(0)
    }, [account, selectedChainId])

    const dataSource = useMemo(() => {
        return value.filter((x) => x.chainId === selectedChainId)
    }, [value, selectedChainId])

    return (
        <HistoryTableUI
            page={page}
            onPageChange={setPage}
            hasNextPage={false}
            isLoading={loading}
            isEmpty={!dataSource.length}
            dataSource={dataSource}
            selectedChainId={selectedChainId}
        />
    )
})

export interface HistoryTableUIProps {
    page: number
    onPageChange: Dispatch<SetStateAction<number>>
    hasNextPage: boolean
    isLoading: boolean
    isEmpty: boolean
    dataSource: Array<Transaction<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    selectedChainId: Web3Helper.ChainIdAll
}

export const HistoryTableUI = memo<HistoryTableUIProps>(
    ({ isLoading, isEmpty, dataSource, page, onPageChange, hasNextPage, selectedChainId }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        return (
            <>
                <TableContainer className={classes.container}>
                    {isLoading || isEmpty ? (
                        <Box flex={1}>
                            {isLoading ? <LoadingPlaceholder /> : null}
                            {isEmpty && !isLoading ? (
                                <EmptyPlaceholder children={t.wallets_empty_history_tips()} />
                            ) : null}
                        </Box>
                    ) : (
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

                            {dataSource.length ? (
                                <TableBody>
                                    {dataSource.map((transaction, index) => (
                                        <HistoryTableRow
                                            key={index}
                                            transaction={transaction}
                                            selectedChainId={selectedChainId}
                                        />
                                    ))}
                                </TableBody>
                            ) : null}
                        </Table>
                    )}
                </TableContainer>

                {!(page === 0 && !hasNextPage) && !isLoading ? (
                    <Box className={classes.footer}>
                        <TablePagination
                            count={-1}
                            component="div"
                            onPageChange={noop}
                            page={page}
                            rowsPerPage={30}
                            rowsPerPageOptions={[30]}
                            labelDisplayedRows={() => null}
                            backIconButtonProps={{
                                onClick: () => onPageChange((prev) => prev - 1),
                                size: 'small',
                                disabled: page === 0,
                            }}
                            nextIconButtonProps={{
                                onClick: () => onPageChange((prev) => prev + 1),
                                disabled: !hasNextPage,
                                size: 'small',
                            }}
                            sx={{ overflow: 'hidden' }}
                        />
                    </Box>
                ) : null}
            </>
        )
    },
)
