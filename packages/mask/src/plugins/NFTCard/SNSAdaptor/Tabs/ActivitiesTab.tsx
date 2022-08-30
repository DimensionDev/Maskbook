import { makeStyles, LoadingBase } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleTokenEvent, Pageable } from '@masknet/web3-shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { Typography, Button } from '@mui/material'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../../../utils'
import { NFTActivityCard, ActivityType } from '../../../../components/shared/NFTCard/NFTActivityCard'

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
        fontSize: 14,
        color: theme.palette.maskColor.publicSecond,
    },
}))

export interface ActivitiesTabProps {
    events: AsyncStateRetry<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>>
}

const resolveActivityType = (type?: string) => {
    if (!type) return ActivityType.Transfer
    if (['created', 'MINT'].includes(type)) return ActivityType.Mint
    if (['successful'].includes(type)) return ActivityType.Sale
    if (['OFFER', 'offer_entered', 'bid_withdrawn', 'bid_entered'].includes(type)) return ActivityType.Offer
    if (['LIST'].includes(type)) return ActivityType.List
    if (['CANCEL_OFFER'].includes(type)) return ActivityType.CancelOffer
    return ActivityType.Transfer
}

export function ActivitiesTab(props: ActivitiesTabProps) {
    const { events } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    const _events = events.value?.data ?? EMPTY_LIST
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
                <NFTActivityCard type={resolveActivityType(x.type)} key={idx} activity={x} />
            ))}
        </div>
    )
}
