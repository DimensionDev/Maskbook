import { memo } from 'react'
import { Table, TableContainer, TableHead, TableRow, TableCell, Box, makeStyles } from '@material-ui/core'

import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { useDashboardI18N } from '../../../../locales'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { WalletContext } from '../../hooks/useWalletContext'
import { LoadingPlaceholder } from '../LoadingPlacholder'

const useStyles = makeStyles((theme) => ({
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        color: MaskColorVar.normalText,
        fontWeight: theme.typography.fontWeightRegular,
    },
}))

export const TokenTable = memo(() => {
    const { detailedTokensError, detailedTokensLoading, detailedTokens } = WalletContext.useContainer()
    const t = useDashboardI18N()
    const classes = useStyles()

    return (
        <TableContainer className={classes.container}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell key="Asset" align="center" className={classes.header}>
                            {t.wallets_assets_asset()}
                        </TableCell>
                        <TableCell key="Balance" align="center" className={classes.header}>
                            {t.wallets_assets_balance()}
                        </TableCell>
                        <TableCell key="Price" align="center" className={classes.header}>
                            {t.wallets_assets_price()}
                        </TableCell>
                        <TableCell key="Value" align="center" className={classes.header}>
                            {t.wallets_assets_value()}
                        </TableCell>
                        <TableCell key="Operation" align="center" className={classes.header}>
                            {t.wallets_assets_operation()}
                        </TableCell>
                    </TableRow>
                </TableHead>
            </Table>
            <Box flex={1}>
                {detailedTokensLoading ? <LoadingPlaceholder /> : null}
                {detailedTokensError ? <EmptyPlaceholder prompt="No assets were queried. Please add tokens." /> : null}
            </Box>
        </TableContainer>
    )
})
