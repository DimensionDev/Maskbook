import React from 'react'
import {
    makeStyles,
    Avatar,
    Typography,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Theme,
    createStyles,
    CircularProgress,
} from '@material-ui/core'
import classNames from 'classnames'
import { resolvePlatformName } from '../type'
import { getActivatedUI } from '../../../social-network/ui'
import { formatCurrency } from '../../Wallet/formatter'
import { useColorStyles } from '../../../utils/theme'
import { useTrending } from '../hooks/useTrending'

const useStyles = makeStyles((theme: Theme) => {
    const internalName = getActivatedUI()?.internalName
    return createStyles({
        root: {
            ...(internalName === 'twitter'
                ? { border: `1px solid ${theme.palette.type === 'dark' ? '#2f3336' : '#ccd6dd'}` }
                : null),
        },
        header: {
            display: 'flex',
        },
        body: {},
        footer: {
            justifyContent: 'flex-end',
        },
        footnote: {
            fontSize: 10,
        },
        avatar: {},
        percentage: {
            marginLeft: theme.spacing(1),
        },
    })
})

export interface TrendingViewProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name: string
}

export function TrendingView(props: TrendingViewProps) {
    const classes = useStyles()
    const color = useColorStyles()
    const { value: trending, loading } = useTrending(props.name)
    if (loading)
        return (
            <Card className={classes.root} elevation={0} component="article">
                <CardActions>
                    <CircularProgress size={20} />
                </CardActions>
            </Card>
        )
    if (!trending) return null
    const { currency, platform } = trending
    return (
        <Card className={classes.root} elevation={0} component="article" style={{ minWidth: 300 }}>
            <CardHeader
                className={classes.header}
                avatar={<Avatar className={classes.avatar} src={trending.coin.image_url} alt={trending.coin.symbol} />}
                title={
                    <Typography variant="h6">{`${trending.coin.symbol.toUpperCase()} / ${currency.name}`}</Typography>
                }
                subheader={
                    <Typography variant="body1">
                        <span>{`${currency.symbol ?? `${currency.name} `}${formatCurrency(
                            trending.market.current_price,
                        )}`}</span>
                        {trending.market.price_change_24h ? (
                            <span
                                className={classNames(
                                    classes.percentage,
                                    trending.market.price_change_24h > 0 ? color.success : color.error,
                                )}>
                                {trending.market.price_change_24h > 0 ? '\u25B2 ' : '\u25BC '}
                                {trending.market.price_change_24h.toFixed(2)}%
                            </span>
                        ) : null}
                    </Typography>
                }
            />
            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} color="textSecondary" variant="subtitle2">
                    Powered by {resolvePlatformName(platform)}
                </Typography>
            </CardActions>
        </Card>
    )
}
