import { memo, useRef } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { useQuery } from '@tanstack/react-query'
import { DSearch } from '@masknet/web3-providers'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { FungibleTokenResult, NonFungibleCollectionResult } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { PluginTraderMessages } from '@masknet/plugin-trader'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { Link } from '@mui/material'

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
                <img width={16} height={16} className={classes.icon} src={data[0].logoURL} />
                <Link fontSize="inherit" href={href}>
                    {children}
                </Link>
            </span>
        )
    }
    return <Link href={href} children={children} fontSize="inherit" />
})
