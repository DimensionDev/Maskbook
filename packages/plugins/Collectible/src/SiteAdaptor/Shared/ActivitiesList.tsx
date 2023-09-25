import { ElementAnchor, EmptyStatus, LoadingStatus, ReloadStatus } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useNonFungibleEvents } from '@masknet/web3-hooks-base'
import { Stack } from '@mui/material'
import { useMemo } from 'react'
import { useCollectibleI18N } from '../../locales/i18n_generated.js'
import { Context } from '../Context/index.js'
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

export function ActivitiesList() {
    const { pluginID, tokenAddress, tokenId, chainId, ownerAddress } = Context.useContainer()

    const t = useCollectibleI18N()
    const { classes } = useStyles()

    const { data, isLoading, error, hasNextPage, fetchNextPage, refetch } = useNonFungibleEvents(
        pluginID,
        tokenAddress,
        tokenId,
        {
            chainId,
            account: ownerAddress,
        },
    )
    const events = useMemo(() => data?.pages.flatMap((x) => x.data) ?? EMPTY_LIST, [data?.pages])
    if (isLoading && !events.length) return <LoadingStatus className={classes.wrapper} />

    if (error) return <ReloadStatus className={classes.wrapper} onRetry={refetch} />

    if (!events.length) return <EmptyStatus height={215}>{t.plugin_collectible_nft_activity_empty()}</EmptyStatus>

    return (
        <div className={classes.wrapper} style={{ justifyContent: 'unset' }}>
            {events.map((x, idx) => (
                <ActivityCard key={idx} activity={x} />
            ))}
            <Stack pb="1px" width="100%" direction="row" justifyContent="center">
                {hasNextPage ? (
                    <Stack py={1}>
                        <ElementAnchor callback={() => fetchNextPage()}>
                            {isLoading ? <LoadingBase /> : null}
                        </ElementAnchor>
                    </Stack>
                ) : null}
            </Stack>
        </div>
    )
}
