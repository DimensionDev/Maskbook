import { CardContent, CircularProgress, Paper, Tab, Tabs } from '@material-ui/core'
import { useCallback, useEffect, useState } from 'react'

import { makeStyles } from '@masknet/theme'
import { useValueRef } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useChainId } from '@masknet/web3-shared'

import { currentAccountSettings } from '../../Wallet/settings'
import { useI18N, I18NFunction } from '../../../utils/i18n-next-ui'

import { SmartYieldPoolView } from './SmartYieldPoolView'
import type { SYPoolModelData, SYPortfolioModelData } from './../apis'
import { useSYPoolData, useSYPortfolioData } from '../hooks/useModels'
import { PluginBarnBridgeMessages } from '../messages'
import PortfolioBalance from './../Import/BarnBridgeFrontEnd/PortfolioBalance'
import { BarnBridgeSmartYieldBarChart, BarnBridgeSmartYieldWallet } from '../BarnBridgeIcon'
import {
    COLOR_BARNBRIDGE_ORANGE,
    COLOR_BARNBRIDGE_BACKGROUND_CARD_DARK,
    COLOR_BARNBRIDGE_BACKGROUND_CARD_LIGHT,
    COLOR_BARNBRIDGE_BACKGROUND_DARK,
    COLOR_BARNBRIDGE_BACKGROUND_LIGHT,
    COLOR_BARNBRIDGE_TEXT_LIGHT,
    COLOR_BARNBRIDGE_TEXT_DARK,
} from '../constants'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: 'var(--contentHeight)',
        padding: '0 !important',
    },
    tabs: {
        backgroundColor:
            theme.palette.mode === 'dark'
                ? COLOR_BARNBRIDGE_BACKGROUND_CARD_DARK
                : COLOR_BARNBRIDGE_BACKGROUND_CARD_LIGHT,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        borderLeft: `solid 1px ${theme.palette.divider}`,
        color: theme.palette.mode === 'dark' ? COLOR_BARNBRIDGE_TEXT_DARK : COLOR_BARNBRIDGE_TEXT_LIGHT,
    },
    indicator: {
        display: 'flex',
        flexDirection: 'column',
        justifySelf: 'center',
        justifyContent: 'center',
        alignSelf: 'centered',
        alignItems: 'center',
        backgroundColor: COLOR_BARNBRIDGE_ORANGE,
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'centered',
    },
    icon: {
        paddingTop: 6,
        color: COLOR_BARNBRIDGE_ORANGE,
    },
    paper: {
        backgroundColor:
            theme.palette.mode === 'dark' ? COLOR_BARNBRIDGE_BACKGROUND_DARK : COLOR_BARNBRIDGE_BACKGROUND_LIGHT,
        paddingTop: 10,
    },
    progress: {
        color: COLOR_BARNBRIDGE_ORANGE,
    },
}))

interface SmartYieldPoolsViewProps {}

export function SmartYieldPoolsView() {
    const [tabIndex, setTabIndex] = useState(0)
    const { t } = useI18N()
    const walletAddress = useValueRef(currentAccountSettings)
    const chainId = useChainId()
    const [_syDataState, setPools] = useState<[SYPoolModelData, SYPortfolioModelData]>([
        {},
        { seniorValue: 0, juniorValue: 0 },
    ])

    //#region data
    const { value: syData, error: error, loading: loadingPools, retry: retry } = useSYPoolData(chainId)
    const {
        value: syPortfolioData,
        error: syPortfolioError,
        loading: loadingPortfolio,
        retry: syPortfolioRetry,
    } = useSYPortfolioData(chainId, walletAddress)
    const { classes } = useStyles()

    useEffect(() => {
        if (syData && syPortfolioData) setPools([syData, syPortfolioData])
    }, [syData, syPortfolioData])

    //#region the donation dialog
    const { setDialog: setDonationDialog } = useRemoteControlledDialog(PluginBarnBridgeMessages.DepositDialogUpdated)
    const onDonate = useCallback(() => {
        if (!syData || !syPortfolioData) return
        setDonationDialog({
            open: true,
            address: '',
            title: '',
        })
    }, [syData, setDonationDialog])
    //#endregion

    if (_syDataState.length <= 1 || loadingPools || loadingPortfolio) {
        return <CircularProgress className={classes.progress} size={50} />
    }

    const protocols = Object.keys(_syDataState[0])
    //#endregion

    //#region tabs
    // Tabs Construction
    const SYPoolsTab = (props: SmartYieldPoolsViewProps) => (
        <Tab
            {...props}
            className={classes.tab}
            key="SYMarkets"
            label={
                <div>
                    <BarnBridgeSmartYieldBarChart className={classes.icon} style={{ verticalAlign: 'middle' }} />
                    {t('plugin_barnbridge_sy_markets')}
                </div>
            }
        />
    )

    const SYWalletTab = (props: SmartYieldPoolsViewProps) => (
        <Tab
            {...props}
            className={classes.tab}
            key="SYPortfolio"
            label={
                <div>
                    <BarnBridgeSmartYieldWallet className={classes.icon} style={{ verticalAlign: 'middle' }} />
                    {t('plugin_barnbridge_sy_portfolio')}
                </div>
            }
        />
    )

    const tabs = [<SYPoolsTab />, <SYWalletTab />]
    //#endregion

    return (
        <CardContent className={classes.root}>
            <Tabs
                className={classes.tabs}
                classes={{
                    indicator: classes.indicator,
                }}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                value={tabIndex}
                orientation="horizontal"
                onChange={(ev: React.ChangeEvent<{}>, newValue: number) => {
                    setTabIndex(newValue)
                }}>
                {tabs}
            </Tabs>
            <Paper className={classes.paper}>
                {tabIndex === 0 ? GenerateSmartYieldPoolViews(classes, _syDataState[0], protocols) : null}
                {tabIndex === 1 ? GenerateSmartYieldPositions(t, _syDataState[1]) : null}
            </Paper>
        </CardContent>
    )
}

function GenerateSmartYieldPositions(t: I18NFunction, syPortfolioData: SYPortfolioModelData) {
    return (
        <PortfolioBalance
            total={syPortfolioData.seniorValue + syPortfolioData.juniorValue}
            data={[
                [t('plugin_barnbridge_sy_senior_balance'), syPortfolioData.seniorValue],
                [t('plugin_barnbridge_sy_junior_balance'), syPortfolioData.juniorValue],
            ]}
        />
    )
}

function GenerateSmartYieldPoolViews(classes: Record<string, string>, syData: SYPoolModelData, protocols: string[]) {
    return (
        <div className={classes.root}>
            {protocols.map((name: string) => (
                <SmartYieldPoolView protocolName={name} key={name} coins={syData[name]} />
            ))}
        </div>
    )
}
