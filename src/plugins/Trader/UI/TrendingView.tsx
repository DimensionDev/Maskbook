import React, { useState, useEffect } from 'react'
import { makeStyles, Avatar, Typography, Card, CardHeader, IconButton, CardActions } from '@material-ui/core'
import { useAsync } from 'react-use'
import SettingsIcon from '@material-ui/icons/Settings'
import { SettingsDialog } from './SettingsDialog'
import { Platform, Currency, resolvePlatformName, Settings } from '../type'
import { getCurrenies } from '../apis'
import { PortalShadowRoot, portalShadowRoot } from '../../../utils/jss/ShadowRootPortal'
import { setStorage, getStorage } from '../../../utils/browser.storage'
import { getActivatedUI } from '../../../social-network/ui'
import stringify from 'json-stable-stringify'
import { currentTrendingViewSettings, currentTrendingViewPlatformSettings } from '../settings'
import { useValueRef } from '../../../utils/hooks/useValueRef'

const network = getActivatedUI().networkIdentifier

const useStyles = makeStyles({
    root: {},
    header: {
        display: 'flex',
    },
    body: {},
    avatar: {},
    amount: {},
})

export interface TrendingViewProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    keyword: string
}

export function TrendingView(props: TrendingViewProps) {
    const classes = useStyles()
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

    const [platform, setPlatform] = useState(Platform.COIN_GECKO)
    const [currency, setCurrency] = useState<Currency | null>(null)

    const networkKey = `${network}-${platform}`
    const trendingSettings = useValueRef<string>(currentTrendingViewSettings[networkKey])
    const trendingPlatformSettings = useValueRef<string>(currentTrendingViewPlatformSettings[network])

    //#region currency & platform
    const { value: currencies = [], loading: loadingCurrencies, error } = useAsync(() => getCurrenies(platform), [
        platform,
    ])

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

    if (loadingCurrencies || !currency) return null
    return (
        <>
            <Card className={classes.root} elevation={0} component="article">
                <CardHeader
                    className={classes.header}
                    avatar={
                        <Avatar src="https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/45_Bitcoin_logo_logos-512.png" />
                    }
                    action={
                        <IconButton size="small" onClick={() => setSettingsDialogOpen(true)}>
                            <SettingsIcon />
                        </IconButton>
                    }
                    title={<Typography variant="h6">{`BTC / ${currency.name}`}</Typography>}
                    subheader={
                        <Typography variant="body1">
                            <span>{`${currency.name} 12,223`}</span>
                            <span>(1.2%)</span>
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
