import { makeStyles, LoadingBase } from '@masknet/theme'
import type { NonFungibleTokenEvent } from '@masknet/web3-shared-base'
import { Typography, Button, Stack } from '@mui/material'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { AsyncStatePageable } from '@masknet/web3-hooks-base'
import { ActivityCard } from './ActivityCard.js'
import { useI18N } from '../../locales/i18n_generated.js'
import { RetryHint } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 280,
        height: 280,
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
    events: AsyncStatePageable<Array<NonFungibleTokenEvent<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>
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

    if (!_events.length)
        return (
            <div className={classes.wrapper}>
                <Icons.EmptySimple className={classes.emptyIcon} />
                <Typography className={classes.emptyText}>{t.plugin_collectible_nft_activity_empty()}</Typography>
            </div>
        )

    return (
        <div className={classes.wrapper} style={{ justifyContent: 'unset' }}>
            {_events?.map((x, idx) => (
                <ActivityCard key={idx} activity={x} />
            ))}
            <Stack pb="1px" width="100%" direction="row" justifyContent="center">
                {!events.ended && (
                    <Button sx={{ mb: 2 }} onClick={() => events.next()} variant="roundedContained">
                        {t.load_more()}
                    </Button>
                )}
            </Stack>
        </div>
    )
}
