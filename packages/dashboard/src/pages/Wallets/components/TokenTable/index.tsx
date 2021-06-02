import { memo, useState } from 'react'
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
} from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { LoadingPlaceholder } from '../LoadingPlacholder'
import { TokenTableRow } from '../TokenTableRow'
import { useAssets, useERC20TokensPaged } from '../../hooks'

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
        background: MaskColorVar.primaryBackground,
    },
    footer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

export const TokenTable = memo(() => {
    const [page, setPage] = useState(1)
    const t = useDashboardI18N()
    const classes = useStyles()

    const { value: erc20Tokens } = useERC20TokensPaged(page, 50)

    const {
        error: detailedTokensError,
        loading: detailedTokensLoading,
        value: detailedTokens,
    } = useAssets(erc20Tokens || [])

    return (
        <>
            <TableContainer className={classes.container}>
                {detailedTokensLoading || detailedTokensError || !detailedTokens.length ? (
                    <Box flex={1}>
                        {detailedTokensLoading ? <LoadingPlaceholder /> : null}
                        {detailedTokensError || !detailedTokens.length ? (
                            <EmptyPlaceholder prompt="No assets were queried. Please add tokens." />
                        ) : null}
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

                        {detailedTokens.length ? (
                            <TableBody>
                                {detailedTokens.map((asset, index) => (
                                    <TokenTableRow asset={asset} key={index} />
                                ))}
                            </TableBody>
                        ) : null}
                    </Table>
                )}
            </TableContainer>
            {!detailedTokensLoading && !detailedTokensError && detailedTokens.length ? (
                <Box className={classes.footer}>
                    <Pagination
                        variant="outlined"
                        shape="rounded"
                        count={10}
                        page={page}
                        onChange={(event, page) => setPage(page)}
                    />
                </Box>
            ) : null}
        </>
    )
})
