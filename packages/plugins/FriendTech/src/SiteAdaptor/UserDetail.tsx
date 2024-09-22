import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HistoryList } from './components/HistoryList.js'
import { HoldingList } from './components/HoldingList.js'
import { UserProfile } from './components/UserProfile.js'
import { useUser } from './hooks/useUser.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<void, 'name' | 'value'>()((theme, _, refs) => ({
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
        boxSizing: 'border-box',
    },
    tabs: {
        display: 'flex',
        gap: theme.spacing(1.5),
        marginTop: theme.spacing(1.5),
    },
    tab: {
        borderRadius: 8,
        border: `1px solid ${theme.palette.maskColor.line}`,
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        flex: 1,
    },
    name: {
        color: theme.palette.maskColor.second,
    },
    value: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        marginLeft: 'auto',
    },
    selectedTab: {
        backgroundColor: theme.palette.maskColor.highlight,
        borderColor: theme.palette.maskColor.highlight,
        [`& .${refs.name}`]: {
            fontWeight: 700,
            color: theme.palette.maskColor.bottom,
        },
        [`& .${refs.value}`]: {
            fontWeight: 700,
            color: theme.palette.maskColor.bottom,
        },
    },
    tabContent: {
        overflow: 'auto',
        marginTop: theme.spacing(1.5),
        overscrollBehavior: 'contain',
        flexGrow: 1,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export const UserDetail = memo(function UserDetail() {
    type TabKey = 'trades' | 'holding'
    const { classes, cx } = useStyles()
    const [params, setParams] = useSearchParams()
    const address = params.get('address')!
    const { data: user, isLoading } = useUser(address)
    const [tab, setTab] = useState<TabKey>('trades')

    useEffect(() => {
        setParams(
            (p) => {
                p.set('title', user?.twitterName || '')
                return p.toString()
            },
            { replace: true },
        )
    }, [user?.twitterName])

    return (
        <div className={classes.container}>
            <UserProfile address={address} user={user} loading={isLoading} variant="other" />
            <div className={classes.tabs}>
                <div
                    className={cx(classes.tab, tab === 'trades' ? classes.selectedTab : undefined)}
                    role="tab"
                    onClick={() => setTab('trades')}>
                    <Typography className={classes.name}>
                        <Trans>Trades</Trans>
                    </Typography>
                </div>
                <div
                    className={cx(classes.tab, tab === 'holding' ? classes.selectedTab : undefined)}
                    role="tab"
                    onClick={() => setTab('holding')}>
                    <Typography className={classes.name}>
                        <Trans>Holding</Trans>
                    </Typography>
                    <Typography className={classes.value}>{user?.holdingCount}</Typography>
                </div>
            </div>
            <div className={classes.tabContent}>
                {tab === 'trades' ?
                    <HistoryList account={address} />
                :   <HoldingList address={address} />}
            </div>
        </div>
    )
})
