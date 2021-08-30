import { useState } from 'react'
import { Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { Trans } from 'react-i18next'
import type { Market } from '../types'
import { getResolutionRules } from '../utils'

import { DESCRIPTION_PRECISION, MARKET_DESCRIPTION_LIMIT } from '../constants'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import DOMPurify from 'isomorphic-dompurify'
import { InfoCell } from './InfoCell'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        alignItems: 'center',
        '& svg': {
            marginRight: theme.spacing(0.5),
        },
    },
    info: {
        border: `solid 1px ${theme.palette.divider}`,
        borderRadius: '.5rem',
        height: '5.375rem',
        '&>.MuiGrid-item:not(:last-of-type)': {
            borderRight: `solid 1px ${theme.palette.divider}`,
        },
        '&>.MuiGrid-item': {
            gridGap: '1.1rem',
            '& .MuiGrid-item:nth-child(2) p': {
                fontSize: '1.25rem',
                fontWeight: 600,
            },
        },
    },
    marketDetails: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        maxWidth: '100%',
    },
    description: {
        whiteSpace: 'pre-line',
    },
}))

interface MarketDescriptionProps {
    market: Market
    collateral: FungibleTokenDetailed
}

export const MarketDescription = (props: MarketDescriptionProps) => {
    const { market, collateral } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    const description = getResolutionRules(market).join('\n\n')
    const cleanDescription = DOMPurify.sanitize(description)
    const [expanded, setExpanded] = useState(cleanDescription.length < MARKET_DESCRIPTION_LIMIT)

    return (
        <div className={classes.root}>
            <Grid container direction="row" wrap="nowrap" className={classes.info}>
                <InfoCell
                    title={t('plugin_augur_24hr_volume')}
                    value={market.ammExchange?.volume24hr?.toString() ?? ''}
                    decimals={collateral.decimals}
                    symbol={collateral.symbol ?? ''}
                    precision={DESCRIPTION_PRECISION}
                />
                <InfoCell
                    title={t('plugin_augur_total_volume')}
                    value={market.ammExchange?.totalVolume?.toString() ?? ''}
                    decimals={collateral.decimals}
                    symbol={collateral.symbol ?? ''}
                    precision={DESCRIPTION_PRECISION}
                />
                <InfoCell
                    title={t('plugin_augur_liquidity')}
                    value={market.ammExchange?.totalLiquidity?.toString() ?? ''}
                    decimals={collateral.decimals}
                    symbol={collateral.symbol ?? ''}
                    precision={DESCRIPTION_PRECISION}
                />
            </Grid>

            {cleanDescription ? (
                <div className={classes.marketDetails}>
                    <Typography variant="h6" color="textPrimary">
                        <Trans i18nKey="plugin_augur_market_details" />
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary" className={classes.description}>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: expanded
                                    ? cleanDescription
                                    : cleanDescription.slice(0, MARKET_DESCRIPTION_LIMIT).concat('...'),
                            }}
                        />
                    </Typography>
                    {cleanDescription.length > MARKET_DESCRIPTION_LIMIT ? (
                        <Typography
                            variant="body2"
                            color="primary"
                            onClick={() => setExpanded(!expanded)}
                            style={{ cursor: 'pointer' }}>
                            {expanded ? (
                                <Trans i18nKey="plugin_dhedge_see_less" />
                            ) : (
                                <Trans i18nKey="plugin_dhedge_see_more" />
                            )}
                        </Typography>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
