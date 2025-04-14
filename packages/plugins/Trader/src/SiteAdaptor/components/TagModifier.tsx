import type { Plugin } from '@masknet/plugin-infra'
import { PluginTraderMessages } from '@masknet/plugin-trader'
import { Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { DSearch } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { FungibleTokenResult, NonFungibleCollectionResult } from '@masknet/web3-shared-base'
import { Link } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { memo, useRef } from 'react'

const useStyles = makeStyles()(() => ({
    tag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        verticalAlign: 'bottom',
    },
    icon: {
        cursor: 'pointer',
        lineHeight: '16px',
        width: 16,
        height: 16,
        borderRadius: 16,
        overflow: 'hidden',
        objectFit: 'cover',
    },
    failedImage: {
        borderRadius: 16,
        overflow: 'hidden',
    },
}))

type TagSearchResult =
    | FungibleTokenResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    | NonFungibleCollectionResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>

export const TagModifier = memo<PropsOf<Plugin.SiteAdaptor.Definition['TagModifier']>>(function TagModifier({
    children,
    href,
}) {
    const { classes } = useStyles()
    const { data } = useQuery({
        queryKey: ['tag', children],
        queryFn: async () => {
            return DSearch.search<TagSearchResult>(children)
        },
    })
    const timerRef = useRef<NodeJS.Timeout>(undefined)
    if (data?.length) {
        return (
            <span
                className={classes.tag}
                onMouseEnter={(event) => {
                    const element = event.currentTarget
                    timerRef.current = setTimeout(() => {
                        PluginTraderMessages.trendingAnchorObserved.sendToLocal({
                            name: children.slice(1),
                            type: children.startsWith('#') ? TrendingAPI.TagType.HASH : TrendingAPI.TagType.CASH,
                            anchorBounding: element.getBoundingClientRect(),
                            anchorEl: element,
                        })
                    }, 300)
                }}
                onMouseLeave={() => {
                    clearTimeout(timerRef.current)
                }}>
                <Image
                    size={16}
                    classes={{ failed: classes.failedImage }}
                    className={classes.icon}
                    src={data[0].logoURL}
                    fallback={
                        <img
                            width={16}
                            height={16}
                            className={classes.icon}
                            src={`https://stamp.firefly.land/logo/${data[0].address}?s=50`}
                        />
                    }
                />

                <Link fontSize="inherit" href={href}>
                    {children}
                </Link>
            </span>
        )
    }
    return <Link href={href} children={children} fontSize="inherit" />
})
