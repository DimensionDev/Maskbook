import { FormattedAddress, FormattedBalance } from '@masknet/shared'
import {
    formatAmountPrecision,
    formatBalance,
    formatEthereumAddress,
    FungibleTokenDetailed,
    isNative,
    resolveAddressLinkOnExplorer,
    resolveTokenLinkOnExplorer,
    useChainId,
    useITOConstants,
} from '@masknet/web3-shared-evm'
import { ONE } from '@masknet/web3-shared-base'
import { Card, Grid, IconButton, Link, Paper, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import LaunchIcon from '@mui/icons-material/Launch'
import RepeatIcon from '@mui/icons-material/Repeat'
import formatDateTime from 'date-fns/format'
import { Fragment, useCallback, useState, useEffect } from 'react'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import type { PoolSettings } from './hooks/useFill'
import { decodeRegionCode, regionCodes } from './hooks/useRegion'

const useSwapItemStyles = makeStyles()({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
})
interface SwapItemProps {
    token?: FungibleTokenDetailed
    swapAmount?: string
    swap?: FungibleTokenDetailed
}

function SwapItem(props: SwapItemProps) {
    const { token, swap, swapAmount } = props
    const [exchange, setExchange] = useState(false)
    const { classes } = useSwapItemStyles()
    const { t } = useI18N()

    const amount_ = formatBalance(swapAmount || '0', swap?.decimals)

    return (
        <div className={classes.root}>
            <Typography variant="body1" color="textPrimary">
                {t('plugin_ito_swap_title', {
                    swap: exchange ? swap?.symbol : token?.symbol,
                    token: exchange ? token?.symbol : swap?.symbol,
                    amount: exchange ? ONE.dividedBy(amount_).toFixed() : amount_,
                })}
            </Typography>
            <div onClick={() => setExchange(!exchange)}>
                <IconButton size="large">
                    <RepeatIcon fontSize="small" />
                </IconButton>
            </div>
        </div>
    )
}
const useStyles = makeStyles()((theme) => ({
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
        color: '#fff',
        padding: theme.spacing(2),
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            padding: theme.spacing(0, 0, 1, 0),
        },
    },
    buttonText: {
        color: '#fff',
    },
    link: {
        padding: 0,
        marginLeft: theme.spacing(0.5),
        marginTop: 2,
    },
    gasEstimation: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        cursor: 'pointer',
        '& > p': {
            marginRight: 5,
            color: theme.palette.mode === 'light' ? '#7B8192' : '#6F767C',
        },
    },
}))
export interface ConfirmDialogProps {
    poolSettings?: PoolSettings
    onDone: () => void
    onBack: () => void
    onClose: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps) {
    const { poolSettings, onDone, onBack, onClose } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const { DEFAULT_QUALIFICATION2_ADDRESS } = useITOConstants()
    const showQualification =
        poolSettings?.advanceSettingData.contract &&
        poolSettings?.qualificationAddress !== DEFAULT_QUALIFICATION2_ADDRESS
    const stop = useCallback((ev: React.MouseEvent<HTMLAnchorElement>) => ev.stopPropagation(), [])

    useEffect(() => {
        if (poolSettings?.token?.chainId !== chainId) onClose()
    }, [onClose, chainId, poolSettings])

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
                                formatter={formatBalance}
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
                                value={poolSettings?.limit}
                                decimals={poolSettings?.token?.decimals}
                                symbol={poolSettings?.token?.symbol}
                                formatter={formatBalance}
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
                        <Typography>{formatDateTime(poolSettings?.startTime!, 'yyyy-MM-dd HH:mm:ss')}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={6}>
                    <Paper className={classes.label}>
                        <Typography>{t('plugin_ito_end_time')}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.data}>
                        <Typography>{formatDateTime(poolSettings?.endTime!, 'yyyy-MM-dd HH:mm:ss')}</Typography>
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
                                        <FormattedAddress
                                            address={poolSettings?.qualificationAddress!}
                                            size={4}
                                            formatter={formatEthereumAddress}
                                        />
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
                                <Typography>{t('plugin_ito_region_confirm_label')}</Typography>
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
                                <Typography>
                                    {formatDateTime(poolSettings?.unlockTime!, 'yyyy-MM-dd HH:mm:ss')}
                                </Typography>
                            </Paper>
                        </Grid>
                    </>
                ) : null}
                <Grid item xs={12}>
                    <Typography variant="h5" className={classes.title} component="p">
                        {t('plugin_ito_send_tip')}
                    </Typography>
                </Grid>
                <Grid item lg={6} xs={12} className={classes.button}>
                    <ActionButton fullWidth variant="outlined" onClick={onBack}>
                        {t('plugin_ito_back')}
                    </ActionButton>
                </Grid>
                <Grid item lg={6} xs={12} className={classes.button}>
                    <ActionButton className={classes.buttonText} fullWidth variant="contained" onClick={onDone}>
                        {t('plugin_ito_send_text', {
                            total: formatAmountPrecision(
                                poolSettings?.total,
                                poolSettings?.token?.decimals,
                                undefined,
                                poolSettings?.token?.decimals,
                            ),
                            symbol: poolSettings?.token?.symbol,
                        })}
                    </ActionButton>
                </Grid>
            </Grid>
        </Card>
    )
}
