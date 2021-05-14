import { Fragment, useCallback, useState } from 'react'
import { makeStyles, Typography, Grid, Paper, Card, IconButton, Link } from '@material-ui/core'
import { useI18N } from '../../../utils'
import type { PoolSettings } from '../hooks/useFillCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import LaunchIcon from '@material-ui/icons/Launch'
import { formatAmountPrecision, formatBalance, FormattedAddress, FormattedBalance } from '@dimensiondev/maskbook-shared'
import { useConstant } from '../../../web3/hooks/useConstant'
import BigNumber from 'bignumber.js'
import { useChainId } from '../../../web3/hooks/useChainId'
import { dateTimeFormat } from '../assets/formatDate'
import { isNative } from '../../../web3/helpers'
import { resolveTokenLinkOnExplorer, resolveAddressLinkOnExplorer } from '../../../web3/pipes'
import type { NativeTokenDetailed, ERC20TokenDetailed } from '../../../web3/types'
import { decodeRegionCode, regionCodes } from '../hooks/useRegion'
import RepeatIcon from '@material-ui/icons/Repeat'
import { ITO_CONSTANTS } from '../constants'

const useSwapItemStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    icon: {},
}))
interface SwapItemProps {
    token?: NativeTokenDetailed | ERC20TokenDetailed
    swapAmount?: string
    swap?: NativeTokenDetailed | ERC20TokenDetailed
}

function SwapItem(props: SwapItemProps) {
    const { token, swap, swapAmount } = props
    const [exchange, setExchange] = useState(false)
    const classes = useSwapItemStyles()
    const { t } = useI18N()

    const amount_ = formatBalance(swapAmount || '0', swap?.decimals)

    return (
        <div className={classes.root}>
            <Typography variant="body1" color="textPrimary">
                {t('plugin_ito_swap_title', {
                    swap: exchange ? swap?.symbol : token?.symbol,
                    token: exchange ? token?.symbol : swap?.symbol,
                    amount: exchange ? new BigNumber(1).div(amount_).toFixed() : amount_,
                })}
            </Typography>
            <div className={classes.icon} onClick={() => setExchange(!exchange)}>
                <IconButton>
                    <RepeatIcon fontSize="small" />
                </IconButton>
            </div>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    title: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        fontSize: 18,
    },
    line: {
        display: 'flex',
        padding: theme.spacing(1),
    },
    data: {
        padding: theme.spacing(1),
        textAlign: 'right',
        color: theme.palette.text.primary,
    },
    label: {
        padding: theme.spacing(1),
        textAlign: 'left',
        color: theme.palette.text.secondary,
    },
    button: {
        padding: theme.spacing(2),
    },
    link: {
        padding: 0,
        marginLeft: theme.spacing(0.5),
        marginTop: 2,
    },
}))
export interface ConfirmDialogProps {
    poolSettings?: PoolSettings
    onDone: () => void
    onBack: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps) {
    const { poolSettings, onDone, onBack } = props
    const classes = useStyles()
    const { t } = useI18N()
    const chainId = useChainId()
    const DEFAULT_QUALIFICATION_ADDRESS = useConstant(ITO_CONSTANTS, 'DEFAULT_QUALIFICATION_ADDRESS')
    const showQualification =
        poolSettings?.advanceSettingData.contract &&
        poolSettings?.qualificationAddress !== DEFAULT_QUALIFICATION_ADDRESS
    const stop = useCallback((ev: React.MouseEvent<HTMLAnchorElement>) => ev.stopPropagation(), [])
    return (
        <Card elevation={0}>
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <Typography variant="h3" className={classes.title} component="h3" color="textPrimary">
                        {poolSettings?.title}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.label}>
                        <Typography>{t('plugin_ito_sell_token')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.data} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Typography variant="body1" component="span">
                            {poolSettings?.token?.symbol}
                        </Typography>
                        {isNative(poolSettings?.token?.address!) ? null : (
                            <Link
                                className={classes.link}
                                href={resolveTokenLinkOnExplorer(poolSettings?.token!)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stop}>
                                <LaunchIcon fontSize="small" />
                            </Link>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper className={classes.label}>
                        <Typography>{t('plugin_ito_sell_total_amount')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.data}>
                        <Typography>
                            <FormattedBalance
                                value={poolSettings?.total}
                                decimals={poolSettings?.token?.decimals}
                                symbol={poolSettings?.token?.symbol}
                            />
                        </Typography>
                    </Paper>
                </Grid>

                {poolSettings?.exchangeTokens.filter(Boolean).map((item, index) => {
                    return (
                        <Fragment key={index}>
                            {index === 0 ? (
                                <Grid item xs={1}>
                                    <Paper className={classes.label}>
                                        <Typography variant="body1" color="textSecondary">
                                            {t('plugin_ito_sell_price')}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ) : null}
                            <Grid item xs={index === 0 ? 11 : 12}>
                                <SwapItem
                                    token={poolSettings.token}
                                    swap={item}
                                    swapAmount={poolSettings?.exchangeAmounts[index]}
                                />
                            </Grid>
                        </Fragment>
                    )
                })}

                <Grid item xs={6}>
                    <Paper className={classes.label}>
                        <Typography>{t('plugin_ito_allocation_per_wallet')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.data}>
                        <Typography>
                            <FormattedBalance
                                value={poolSettings?.total}
                                decimals={poolSettings?.token?.decimals}
                                symbol={poolSettings?.token?.symbol}
                            />
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper className={classes.label}>
                        <Typography>{t('plugin_ito_begin_time')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.data}>
                        <Typography>{dateTimeFormat(poolSettings?.startTime!)}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper className={classes.label}>
                        <Typography>{t('plugin_ito_end_time')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.data}>
                        <Typography>{dateTimeFormat(poolSettings?.endTime!)}</Typography>
                    </Paper>
                </Grid>
                {showQualification ? (
                    <>
                        <Grid item xs={6}>
                            <Paper className={classes.label}>
                                <Typography>{t('plugin_ito_qualification_label')}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper className={classes.data}>
                                <Link
                                    href={resolveAddressLinkOnExplorer(chainId, poolSettings?.qualificationAddress!)}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <Typography>
                                        <FormattedAddress address={poolSettings?.qualificationAddress!} size={4} />
                                    </Typography>
                                </Link>
                            </Paper>
                        </Grid>
                    </>
                ) : null}
                {poolSettings?.regions ? (
                    <>
                        <Grid item xs={6}>
                            <Paper className={classes.label}>
                                <Typography>{t('plugin_ito_region_comfirm_label')}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper className={classes.data}>
                                <Typography>
                                    {decodeRegionCode(poolSettings?.regions!).length}/{regionCodes.length}
                                </Typography>
                            </Paper>
                        </Grid>
                    </>
                ) : null}
                {poolSettings?.unlockTime ? (
                    <>
                        <Grid item xs={6}>
                            <Paper className={classes.label}>
                                <Typography>{t('plugin_ito_unlock_time')}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper className={classes.data}>
                                <Typography>{dateTimeFormat(poolSettings?.unlockTime!)}</Typography>
                            </Paper>
                        </Grid>
                    </>
                ) : null}
                <Grid item xs={12}>
                    <Typography variant="h5" className={classes.title} component="p">
                        {t('plugin_ito_send_tip')}
                    </Typography>
                </Grid>
                <Grid item xs={6} className={classes.button}>
                    <ActionButton fullWidth variant="outlined" onClick={onBack}>
                        {t('plugin_ito_back')}
                    </ActionButton>
                </Grid>
                <Grid item xs={6} className={classes.button}>
                    <ActionButton fullWidth variant="contained" onClick={onDone}>
                        {t('plugin_ito_send_text', {
                            total: formatAmountPrecision(poolSettings?.total, poolSettings?.token?.decimals),
                            symbol: poolSettings?.token?.symbol,
                        })}
                    </ActionButton>
                </Grid>
            </Grid>
        </Card>
    )
}
