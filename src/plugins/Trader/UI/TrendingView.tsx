import React, { useState, useEffect } from 'react'
import {
    makeStyles,
    Avatar,
    Typography,
    Card,
    CardHeader,
    IconButton,
    CardActions,
    Theme,
    createStyles,
} from '@material-ui/core'
import { useAsync } from 'react-use'
import SettingsIcon from '@material-ui/icons/Settings'
import classNames from 'classnames'
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { SettingsDialog } from './SettingsDialog'
import { Platform, Currency, resolvePlatformName, Settings } from '../type'
import { PortalShadowRoot, portalShadowRoot } from '../../../utils/jss/ShadowRootPortal'
import { setStorage, getStorage } from '../../../utils/browser.storage'
import { getActivatedUI } from '../../../social-network/ui'
import stringify from 'json-stable-stringify'
import { currentTrendingViewSettings, currentTrendingViewPlatformSettings } from '../settings'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import Services from '../../../extension/service'
import { formatCurrency } from '../../Wallet/formatter'
import { useColorStyles } from '../../../utils/theme'

const network = getActivatedUI().networkIdentifier

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        header: {
            display: 'flex',
        },
        body: {},
        avatar: {},
        percentage: {
            marginLeft: theme.spacing(1),
        },
    }),
)

export interface TrendingViewProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    keyword: string
}

export function TrendingView(props: TrendingViewProps) {
    const classes = useStyles()
    const color = useColorStyles()
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

    const [platform, setPlatform] = useState(Platform.COIN_GECKO)
    const [currency, setCurrency] = useState<Currency | null>(null)

    const networkKey = `${network}-${platform}`
    const trendingSettings = useValueRef<string>(currentTrendingViewSettings[networkKey])
    const trendingPlatformSettings = useValueRef<string>(currentTrendingViewPlatformSettings[network])

    //#region currency & platform
    const { value: currencies = [], loading: loadingCurrencies } = useAsync(
        () => Services.Plugin.invokePlugin('maskbook.trader', 'getCurrenies', platform),
        [platform],
    )

    // sync platform
    useEffect(() => {
        if (String(platform) !== trendingPlatformSettings) {
            if (trendingPlatformSettings === String(Platform.COIN_GECKO)) setPlatform(Platform.COIN_GECKO)
            if (trendingPlatformSettings === String(Platform.COIN_MARKET_CAP)) setPlatform(Platform.COIN_MARKET_CAP)
        }
    }, [platform, trendingPlatformSettings])

    // sync currency
    useEffect(() => {
        if (!currencies.length) return
        try {
            const parsed = JSON.parse(trendingSettings || '{}') as Settings
            if (parsed.currency && currencies.some((x) => x.id === parsed.currency.id)) setCurrency(parsed.currency)
            else setCurrency(currencies[0])
        } catch (e) {
            setCurrency(null)
        }
    }, [trendingSettings, currencies.length])
    //#endregion

    //#region coins info
    const { value: coinInfo, loading: loadingCoinInfo, error } = useAsync(async () => {
        if (!currency) return null
        return Services.Plugin.invokePlugin(
            'maskbook.trader',
            'getCoinTrendingByKeyword',
            props.keyword,
            platform,
            currency,
        )
    }, [platform, currency, props.keyword])
    //#endregion
    if (loadingCurrencies || !currency) return null
    if (loadingCoinInfo || !coinInfo) return null

    return (
        <>
            <Card className={classes.root} elevation={0} component="article">
                <CardHeader
                    className={classes.header}
                    avatar={<Avatar src={coinInfo.coin.image_url} alt={coinInfo.coin.symbol} />}
                    action={
                        <IconButton size="small" onClick={() => setSettingsDialogOpen(true)}>
                            <SettingsIcon />
                        </IconButton>
                    }
                    title={
                        <Typography variant="h6">{`${coinInfo.coin.symbol.toUpperCase()} / ${
                            currency.name
                        }`}</Typography>
                    }
                    subheader={
                        <Typography variant="body1">
                            <span>{`${currency.symbol ?? currency.name} ${formatCurrency(
                                coinInfo.market.current_price,
                            )}`}</span>
                            {coinInfo.market.price_change_24h ? (
                                <span
                                    className={classNames(
                                        classes.percentage,
                                        coinInfo.market.price_change_24h > 0 ? color.success : color.error,
                                    )}>
                                    {coinInfo.market.price_change_24h > 0 ? '\u25B2 ' : '\u25BC '}
                                    {coinInfo.market.price_change_24h.toFixed(2)}%
                                </span>
                            ) : null}
                        </Typography>
                    }
                />
                <CardActions>
                    <Typography color="textSecondary" variant="body2">
                        Powered by {resolvePlatformName(platform)}
                    </Typography>
                </CardActions>
            </Card>
            <SettingsDialog
                open={settingsDialogOpen}
                currencies={currencies}
                currency={currency}
                platform={platform}
                onCurrencyChange={(currency) => {
                    currentTrendingViewSettings[networkKey].value = stringify({
                        currency,
                    })
                }}
                onPlatformChange={(platform) => {
                    currentTrendingViewPlatformSettings[network].value = String(platform)
                }}
                onClose={() => setSettingsDialogOpen(false)}
            />
        </>
    )
}
