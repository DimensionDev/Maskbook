import { Dispatch, memo, SetStateAction, useState } from 'react'
import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Box,
    makeStyles,
    TableBody,
    Pagination,
    PaginationItem,
} from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { LoadingPlaceholder } from '../LoadingPlacholder'
import { TokenTableRow } from '../TokenTableRow'
import { formatBalance } from '@masknet/shared'
import BigNumber from 'bignumber.js'
import { ceil } from 'lodash-es'
import { Asset, useAssets, useERC20TokensPaged } from '@masknet/web3-shared'

const useStyles = makeStyles((theme) => ({
    container: {
        height: 'calc(100% - 58px)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100% - 58px)',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular,
        padding: '24px 28px',
        backgroundColor: MaskColorVar.primaryBackground,
    },
    footer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationItem: {
        borderRadius: 4,
        border: `1px solid ${MaskColorVar.lineLight}`,
        color: MaskColorVar.textPrimary,
        '&.Mui-selected': {
            backgroundColor: MaskColorVar.blue,
            color: '#ffffff',
            border: 'none',
            '&:hover': {
                backgroundColor: MaskColorVar.blue,
            },
        },
    },
}))

export const TokenTable = memo(() => {
    const [page, setPage] = useState(1)

    const { value } = useERC20TokensPaged(page - 1, 50)

    const {
        error: detailedTokensError,
        loading: detailedTokensLoading,
        value: detailedTokens,
    } = useAssets(value?.tokens || [])

    return (
        <TokenTableUI
            page={page}
            onPageChange={setPage}
            isLoading={detailedTokensLoading}
            isEmpty={!!detailedTokensError || !detailedTokens.length}
            showPagination={!detailedTokensLoading && !detailedTokensError && !!detailedTokens.length}
            dataSource={detailedTokens}
            count={ceil((!!value?.count ? value.count : 1) / 50) ?? 1}
        />
    )
})

export interface TokenTableUIProps {
    page: number
    onPageChange: Dispatch<SetStateAction<number>>
    isLoading: boolean
    isEmpty: boolean
    showPagination: boolean
    dataSource: Asset[]
    count: number
}

export const TokenTableUI = memo<TokenTableUIProps>(
    ({ page, onPageChange, isLoading, isEmpty, showPagination, dataSource, count }) => {
        const t = useDashboardI18N()
        const classes = useStyles()

        return (
            <>
                <TableContainer className={classes.container}>
                    {isLoading || isEmpty ? (
                        <Box flex={1}>
                            {isLoading ? <LoadingPlaceholder /> : null}
                            {isEmpty ? <EmptyPlaceholder children={t.wallets_empty_tokens_tip()} /> : null}
                        </Box>
                    ) : (
                        <Table stickyHeader sx={{ padding: '0 44px' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell key="Asset" align="center" variant="head" className={classes.header}>
                                        {t.wallets_assets_asset()}
                                    </TableCell>
                                    <TableCell key="Balance" align="center" variant="head" className={classes.header}>
                                        {t.wallets_assets_balance()}
                                    </TableCell>
                                    <TableCell key="Price" align="center" variant="head" className={classes.header}>
                                        {t.wallets_assets_price()}
                                    </TableCell>
                                    <TableCell key="Value" align="center" variant="head" className={classes.header}>
                                        {t.wallets_assets_value()}
                                    </TableCell>
                                    <TableCell key="Operation" align="center" variant="head" className={classes.header}>
                                        {t.wallets_assets_operation()}
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            {dataSource.length ? (
                                <TableBody>
                                    {dataSource
                                        .sort((first, second) => {
                                            const firstValue = new BigNumber(
                                                formatBalance(first.balance, first.token.decimals),
                                            )
                                            const secondValue = new BigNumber(
                                                formatBalance(second.balance, second.token.decimals),
                                            )

                                            if (firstValue.eq(secondValue)) return 0

                                            return Number(firstValue.lt(secondValue))
                                        })
                                        .map((asset, index) => (
                                            <TokenTableRow asset={asset} key={index} />
                                        ))}
                                </TableBody>
                            ) : null}
                        </Table>
                    )}
                </TableContainer>
                {showPagination ? (
                    <Box className={classes.footer}>
                        <Pagination
                            variant="outlined"
                            shape="rounded"
                            count={count}
                            page={page}
                            onChange={(event, page) => onPageChange(page)}
                            renderItem={(item) => (
                                <PaginationItem {...item} classes={{ root: classes.paginationItem }} />
                            )}
                        />
                    </Box>
                ) : null}
            </>
        )
    },
)
