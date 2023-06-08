import { Icons } from '@masknet/icons'
import { ElementAnchor, EmptyStatus, RetryHint } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { AsyncStatePageable } from '@masknet/web3-hooks-base'
import type { NonFungibleTokenEvent } from '@masknet/web3-shared-base'
import { Stack } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'
import { ActivityCard } from './ActivityCard.js'

const useStyles = makeStyles()({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 280,
        height: 280,
        width: '100%',
        justifyContent: 'center',
        rowGap: 12,
    },
})

export interface ActivitiesListProps {
    events: AsyncStatePageable<NonFungibleTokenEvent<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
}

export function ActivitiesList(props: ActivitiesListProps) {
    const { events } = props
    const _events = events.value ?? EMPTY_LIST

    const t = useI18N()
    const { classes } = useStyles()

    if (events.loading && !_events.length)
        return (
            <div className={classes.wrapper}>
                <LoadingBase />
            </div>
        )

    if (events.error || !events.value)
        return (
            <div className={classes.wrapper}>
                <RetryHint
                    ButtonProps={{ startIcon: <Icons.Restore color="white" size={18} />, sx: { width: 256 } }}
                    retry={() => events.retry()}
                />
            </div>
        )

    if (!_events.length) return <EmptyStatus height={280}>{t.plugin_collectible_nft_activity_empty()}</EmptyStatus>

    return (
        <div className={classes.wrapper} style={{ justifyContent: 'unset' }}>
            {_events?.map((x, idx) => (
                <ActivityCard key={idx} activity={x} />
            ))}
            <Stack pb="1px" width="100%" direction="row" justifyContent="center">
                {!events.ended && (
                    <Stack py={1}>
                        <ElementAnchor callback={() => events.next()}>
                            {events.loading ? <LoadingBase /> : null}
                        </ElementAnchor>
                    </Stack>
                )}
            </Stack>
        </div>
    )
}
