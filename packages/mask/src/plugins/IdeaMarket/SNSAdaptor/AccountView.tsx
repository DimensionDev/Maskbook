import Table from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@masknet/theme'
import { Button, Grid, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useFetchUserTokens } from '../hooks/useFetchUserTokens'
import { useAccount } from '@masknet/web3-shared-evm'
import { LoadingAnimation } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { leftShift } from '@masknet/web3-shared-base'
import type { UserIdeaTokenBalance } from '../types'
import { composeIdeaURL } from '../utils'

const useStyles = makeStyles()((theme) => {
    return {
        empty: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(8, 0),
        },
        actionButtons: {
            width: 96,
        },
        name: {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        nameHeader: {
            width: 200,
        },
        market: {
            color: 'rgba(8,87,224,1)',
            marginLeft: theme.spacing(0.25),
        },
        row: {
            '&:nth-of-type(odd)': {
                backgroundColor: theme.palette.background.default,
            },
        },
    }
})

export function AccountView() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const { value, error, loading } = useFetchUserTokens(account)
    const userTokenBalances = value?.ideaTokenBalances

    if (loading) {
        return (
            <div className={classes.empty}>
                <LoadingAnimation />
            </div>
        )
    }

    if (error || !value) {
        return (
            <Typography className={classes.empty} color="textPrimary">
                {t('plugin_ideamarket_smthg_wrong')}
            </Typography>
        )
    }

    return (
        <>
            <TableContainer component={Paper} sx={{ width: '100%' }}>
                <Table sx={{ tableLayout: 'fixed', width: '100%' }} size="small" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.nameHeader} key="name">
                                Idea
                            </TableCell>
                            <TableCell key="price">Price</TableCell>
                            <TableCell key="balance">Balance</TableCell>
                            <TableCell key="value">Value</TableCell>
                            {/* <TableCell key="dayChange">24H change</TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {userTokenBalances.map((balance: UserIdeaTokenBalance) => {
                            const name =
                                balance.token.name.length > 30
                                    ? balance.token.name.slice(0, 30).concat('...')
                                    : balance.token.name
                            const tokenPrice = Number(balance.token.latestPricePoint.price).toFixed(2)
                            const userTokenBalance = leftShift(balance.amount, 18).toFixed(2, 1)
                            const balanceValue =
                                balance.token.latestPricePoint.price * leftShift(balance.amount, 18).toNumber()

                            const totalBalance = (Number(balanceValue) - Number(balanceValue) * 0.01).toFixed(2)

                            return (
                                <TableRow className={classes.row} key={balance.id}>
                                    <TableCell className={classes.name}>
                                        <Grid container direction="column">
                                            <div title={balance.token.name}>{name}</div>
                                            <div className={classes.market}>{balance.token.market.name}</div>
                                        </Grid>
                                    </TableCell>
                                    <TableCell>&#36;{tokenPrice}</TableCell>
                                    <TableCell>{userTokenBalance}</TableCell>
                                    <TableCell>&#36;{totalBalance}</TableCell>
                                    {/* <TableCell>{formatWithOperator(balance.token.dayChange)}</TableCell> */}
                                    <TableCell className={classes.actionButtons}>
                                        <Grid container alignContent="center" justifyContent="center">
                                            <Grid item>
                                                <Button
                                                    href={composeIdeaURL(balance.token.market.name, balance.token.name)}
                                                    target="_blank"
                                                    color="primary"
                                                    size="small"
                                                    variant="contained">
                                                    {t('plugin_ideamarket_sell')}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
