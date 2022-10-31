import { makeStyles, LoadingBase } from '@masknet/theme'
import type { NonFungibleTokenEvent, Pageable } from '@masknet/web3-shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { Typography, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ActivityCard } from './ActivityCard.js'
import { useI18N } from '../../../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
        width: '100%',
        gap: 12,
        justifyContent: 'center',
    },
    emptyIcon: {
        width: 36,
        height: 36,
    },
    emptyText: {
        color: theme.palette.maskColor.publicSecond,
    },
}))

export interface ActivitiesListProps {
    events: AsyncStateRetry<Pageable<NonFungibleTokenEvent<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>
}

export function ActivitiesList(props: ActivitiesListProps) {
    const { events } = props
    const _events = events.value?.data ?? EMPTY_LIST

    const { t } = useI18N()
    const { classes } = useStyles()

    if (events.loading)
        return (
            <div className={classes.wrapper}>
                <LoadingBase />
            </div>
        )
    if (events.error || !events.value)
        return (
            <div className={classes.wrapper}>
                <Typography className={classes.emptyText}>{t('plugin_furucombo_load_failed')}</Typography>
                <Button variant="text" onClick={() => events.retry()}>
                    {t('retry')}
                </Button>
            </div>
        )
    if (!_events.length)
        return (
            <div className={classes.wrapper}>
                <Icons.EmptySimple className={classes.emptyIcon} />
                <Typography className={classes.emptyText}>{t('plugin_collectible_nft_activity_empty')}</Typography>
            </div>
        )

    return (
        <div className={classes.wrapper} style={{ justifyContent: 'unset' }}>
            {_events?.map((x, idx) => (
                <ActivityCard key={idx} activity={x} />
            ))}
        </div>
    )
}
