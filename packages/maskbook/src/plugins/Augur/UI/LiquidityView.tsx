import type { Market } from '../types'
import { makeStyles } from '@masknet/theme'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    Button,
    Typography,
} from '@material-ui/core'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        alignItems: 'center',
    },
    info: {
        border: `solid 1px ${theme.palette.divider}`,
        borderRadius: '.5rem',
    },
    actions: {
        display: 'flex',
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(0),
    },
    label: {
        flexDirection: 'column',
    },
    buttons: {
        marginBottom: theme.spacing(1),
    },
}))

interface LiquidityProps {
    market: Market
}

export function LiquidityView(props: LiquidityProps) {
    const { market } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <div className={classes.root}>
            <TableContainer component={Paper} className={classes.info}>
                <Table aria-label="Liquidity table">
                    <caption>
                        {/* If there is a liquidity */}
                        <Grid container className={classes.buttons}>
                            <Grid item className={classes.actions} xs={6}>
                                <Button variant="contained" fullWidth color="primary">
                                    <Typography>{t('plugin_augur_remove_liquidity')}</Typography>
                                </Button>
                            </Grid>
                            <Grid item className={classes.actions} xs={6}>
                                <Button variant="outlined" fullWidth className={classes.label}>
                                    <Typography color="primary">{t('plugin_augur_add_liquidity')}</Typography>
                                </Button>
                            </Grid>
                        </Grid>
                        {/* If there is no row */}
                        <Grid container className={classes.buttons} alignItems="center">
                            <Grid item className={classes.actions} xs={4}>
                                <Typography color="textSecondary" variant="caption">
                                    {t('plugin_augur_no_liquidity')}
                                </Typography>
                            </Grid>
                            <Grid item className={classes.actions} xs={8}>
                                <Button variant="contained" fullWidth color="primary">
                                    <Typography>{t('plugin_augur_add_liquidity_button_caption')}</Typography>
                                </Button>
                            </Grid>
                        </Grid>
                    </caption>

                    <TableHead>
                        <TableRow>
                            <TableCell align="center">
                                {t('plugin_augur_tab_liquidity_column_share_of_liquidity_pool')}
                            </TableCell>
                            <TableCell align="center">{t('plugin_augur_tab_liquidity_column_init_value')}</TableCell>
                            <TableCell align="center">{t('plugin_augur_tab_liquidity_column_cur_value')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* {rows.map here} */}
                        <TableRow>
                            <TableCell align="center">0.00%</TableCell>
                            <TableCell align="center">$0.01</TableCell>
                            <TableCell align="center">$0.00</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}
