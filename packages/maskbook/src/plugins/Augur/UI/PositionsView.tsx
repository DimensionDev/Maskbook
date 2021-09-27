import type { Market } from '../types'
import { makeStyles } from '@masknet/theme'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@material-ui/core'
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
    success: {
        color: theme.palette.success.main,
    },
    fail: {
        color: theme.palette.error.main,
    },
}))

interface PositionsProps {
    market: Market
}

export function PositionsView(props: PositionsProps) {
    const { market } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    return (
        <div className={classes.root}>
            <TableContainer component={Paper} className={classes.info}>
                <Table aria-label="Liquidity table">
                    {/* If there is no positions */}
                    <caption>
                        <Typography color="textSecondary" variant="caption" align="center" paragraph>
                            {t('plugin_augur_no_positions')}
                        </Typography>
                    </caption>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{t('plugin_augur_tab_positions_column_outcome')}</TableCell>
                            <TableCell align="center">
                                {t('plugin_augur_tab_positions_column_quantity_owned')}
                            </TableCell>
                            <TableCell align="center">
                                {t('plugin_augur_tab_positions_column_avg_price_paid')}
                            </TableCell>
                            <TableCell align="center">{t('plugin_augur_tab_positions_column_init_value')}</TableCell>
                            <TableCell align="center">{t('plugin_augur_tab_positions_column_cur_value')}</TableCell>
                            <TableCell align="center">{t('plugin_augur_tab_positions_column_p_l')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* {rows.map here} */}
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell align="center">Philadelphia Eagles 0.5</TableCell>
                            <TableCell align="center">0.0274</TableCell>
                            <TableCell align="center">$0.38</TableCell>
                            <TableCell align="center">$0.01</TableCell>
                            <TableCell align="center">$0.01</TableCell>
                            <TableCell align="center" classes={{ root: classes.fail }}>
                                $-0.00
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell align="center">Dallas Cowboys 0.5</TableCell>
                            <TableCell align="center">0.0044</TableCell>
                            <TableCell align="center">$0.49</TableCell>
                            <TableCell align="center">$0.00</TableCell>
                            <TableCell align="center">$0.00</TableCell>
                            <TableCell align="center" classes={{ root: classes.success }}>
                                $0.00
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}
