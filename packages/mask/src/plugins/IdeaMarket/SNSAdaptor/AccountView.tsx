import Table from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import { makeStyles } from '@masknet/theme'
import { Avatar, Button, Grid, Link, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useFetchUserTokens } from '../hooks/useFetchUserTokens'
import { useAccount } from '@masknet/web3-shared-evm'
import { LoadingAnimation } from '@masknet/shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import { leftShift } from '@masknet/web3-shared-base'
import { Markets, UserIdeaTokenBalance } from '../types'
import { BASE_URL, TWITTER_BASE_URL } from '../constants'
import { UrlIcon } from '../icons/UrlIcon'
import { urlWithoutProtocol } from '../utils'
import { EMPTY_LIST } from '@masknet/shared-base'
import BigNumber from 'bignumber.js'

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
        tableContainer: {
            width: '100%',
        },
        table: {
            tableLayout: 'fixed',
            width: '100%',
            '& td': {
                height: 60,
                padding: '0px 0px',
            },
        },
        name: {
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            '& p': {
                textOverflow: 'ellipsis',
                overflow: 'hidden',
            },
            marginLeft: theme.spacing(1.25),
        },
        header: {
            padding: 0,
        },
        nameHeader: {
            width: 190,
        },
        sellHeader: {
            width: 55,
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
        profileAvatar: {
            float: 'left',
            marginTop: theme.spacing(1.1),
        },
        avatar: {
            marginRight: theme.spacing(0.8),
            marginLeft: theme.spacing(0.1),
            width: 27,
            height: 27,
        },
        url: {
            marginRight: theme.spacing(0.7),
            width: 30,
            height: 30,
        },
        nameCellContainer: {
            width: '100%',
        },
        sellButton: {
            padding: theme.spacing(0, 10),
        },
    }
})

export function AccountView() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const { value: userTokenBalances = EMPTY_LIST, error, loading } = useFetchUserTokens(account)

    if (loading) {
        return (
            <div className={classes.empty}>
                <LoadingAnimation />
            </div>
        )
    }

    if (error) {
        return (
            <Typography className={classes.empty} color="textPrimary">
                {t('plugin_ideamarket_something_wrong')}
            </Typography>
        )
    }

    if (userTokenBalances.length === 0) {
        return (
            <Typography className={classes.empty} color="textPrimary">
                {t('no_data')}
            </Typography>
        )
    }

    return (
        <>
            <TableContainer component={Paper} className={classes.tableContainer}>
                <Table className={classes.table} size="small" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell key="name" className={classes.nameHeader}>
                                {t('plugin_ideamarket_name')}
                            </TableCell>
                            <TableCell align="center" key="price" className={classes.header}>
                                {t('plugin_ideamarket_price')}
                            </TableCell>
                            <TableCell align="center" key="balance" className={classes.header}>
                                {t('plugin_ideamarket_balance')}
                            </TableCell>
                            <TableCell align="center" key="value" className={classes.header}>
                                {t('plugin_ideamarket_value')}
                            </TableCell>
                            <TableCell key="sell" className={classes.sellHeader} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {userTokenBalances?.map((balance: UserIdeaTokenBalance) => {
                            const token = balance.token
                            const name =
                                balance.token.name.length > 30
                                    ? balance.token.name.slice(0, 30).concat('...')
                                    : balance.token.name
                            const tokenPrice = new BigNumber(balance.token.latestPricePoint.price)
                            const userTokenBalance = leftShift(balance.amount, 18)
                            const balanceValue = tokenPrice.multipliedBy(userTokenBalance)
                            const platformFee = new BigNumber(0.01)
                            const perceivedBalanceValue = balanceValue.minus(balanceValue.multipliedBy(platformFee))

                            return (
                                <TableRow className={classes.row} key={balance.id}>
                                    <TableCell>
                                        <div className={classes.name}>
                                            <div className={classes.profileAvatar}>
                                                {token.twitter ? (
                                                    <Avatar
                                                        className={classes.avatar}
                                                        src={token?.twitter.profile_image_url}
                                                    />
                                                ) : (
                                                    <UrlIcon className={classes.url} />
                                                )}
                                            </div>
                                            {balance.token.market.marketID === Markets.Twitter ? (
                                                <Grid>
                                                    <Typography title={token.twitter ? token.twitter.name : token.name}>
                                                        {token.twitter?.name} ({token.name})
                                                    </Typography>
                                                    {token.twitter ? (
                                                        <Typography
                                                            title={`${TWITTER_BASE_URL}/${token.twitter.username}`}
                                                            className={classes.market}>
                                                            <Link
                                                                target="_blank"
                                                                href={`${TWITTER_BASE_URL}/${token.twitter.username}`}>
                                                                {TWITTER_BASE_URL}/{token.twitter.username}
                                                            </Link>
                                                        </Typography>
                                                    ) : (
                                                        <Typography title={token.name} className={classes.market}>
                                                            <Link
                                                                target="_blank"
                                                                href={`${TWITTER_BASE_URL}/${token.name.slice(1)}`}>
                                                                {TWITTER_BASE_URL}/{token.name.slice(1)}
                                                            </Link>
                                                        </Typography>
                                                    )}
                                                </Grid>
                                            ) : (
                                                <Grid item>
                                                    <Typography title={token.name}>
                                                        {urlWithoutProtocol(token.name)}
                                                    </Typography>

                                                    <Typography title={token.name} className={classes.market}>
                                                        <Link target="_blank" href={token.name}>
                                                            {token.name}
                                                        </Link>
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell align="center">${tokenPrice.toFixed(2, 1)}</TableCell>
                                    <TableCell align="center">{userTokenBalance.toFixed(2, 1)}</TableCell>
                                    <TableCell align="center">${perceivedBalanceValue.toFixed(2, 1)}</TableCell>
                                    <TableCell>
                                        <Grid container alignContent="center" justifyContent="center">
                                            <Button
                                                href={`${BASE_URL}/i/${balance.token.id}`}
                                                target="_blank"
                                                color="primary"
                                                size="small"
                                                variant="contained">
                                                {t('plugin_ideamarket_sell')}
                                            </Button>
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
