import { Icons, type GeneratedIconProps, type GeneratedIcon } from '@masknet/icons'
import { MaskColors, makeStyles } from '@masknet/theme'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { Box, IconButton, List, ListItem, Typography, type BoxProps, Link } from '@mui/material'
import { sortBy } from 'lodash-es'
import { forwardRef, useMemo } from 'react'
import { useRedPacketTrans, RedPacketTrans } from '../locales/i18n_generated.js'
import { usePostLink } from '@masknet/plugin-infra/content-script'
import { usePlatformType } from './hooks/usePlatformType.js'

const useStyles = makeStyles()((theme) => ({
    box: {
        backgroundColor: 'rgba(24,24,24,0.8)',
        color: MaskColors.dark.text.primary,
        borderRadius: 16,
        padding: theme.spacing(2, 3),
    },
    header: {
        fontSize: 16,
        height: 20,
        fontWeight: 700,
        paddingBottom: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.common.white}`,

        display: 'flex',
        alignItems: 'center',
    },
    closeButton: {
        marginLeft: 'auto',
        color: theme.palette.common.white,
        padding: 0,
    },
    list: {
        padding: 0,
    },
    item: {
        marginTop: theme.spacing(2),
        padding: 0,
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        height: 18,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        marginRight: 10,
        fontWeight: 'bold',
        '&::first-letter': {
            textTransform: 'uppercase',
        },
    },
    icon: {
        marginRight: 10,
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
    },
    linkIcon: {
        opacity: 0.5,
        color: theme.palette.common.white,
    },
    state: {
        marginLeft: 'auto',
    },
}))

function ResultIcon({ result, ...props }: GeneratedIconProps & { result: boolean }) {
    const Icon = result ? Icons.ResultYes : Icons.ResultNo
    return <Icon {...props} />
}

interface Props extends BoxProps {
    onClose?(): void
    statusList: FireflyRedPacketAPI.ClaimStrategyStatus[]
    showResults?: boolean
}

const IconMap: Record<FireflyRedPacketAPI.PostReactionKind, GeneratedIcon> = {
    like: Icons.Heart,
    repost: Icons.Repost,
    quote: Icons.Repost,
    comment: Icons.Comment,
    collect: Icons.Heart,
}

function resolveProfileUrl(platform: FireflyRedPacketAPI.PlatformType, handle: string) {
    switch (platform) {
        case FireflyRedPacketAPI.PlatformType.farcaster:
            return `/profile/farcaster/${handle}`
        case FireflyRedPacketAPI.PlatformType.lens:
            return `/profile/lens/${handle}`
        case FireflyRedPacketAPI.PlatformType.twitter:
            return `/${handle}`
    }
}

export const Requirements = forwardRef<HTMLDivElement, Props>(function Requirements(
    { onClose, statusList, showResults = true, ...props }: Props,
    ref,
) {
    const t = useRedPacketTrans()
    const { classes, cx } = useStyles()
    const link = usePostLink()
    const platform = usePlatformType()
    const requirements = useMemo(() => {
        const orders = ['profileFollow', 'postReaction', 'nftOwned'] as const
        const orderedStatusList = sortBy(statusList, (x) => orders.indexOf(x.type))
        return orderedStatusList.flatMap((status) => {
            if (status.type === 'profileFollow') {
                const payload = status.payload.filter((x) => x.platform === platform)
                const handles = payload.map((x) => `@${x.handle}`)
                return (
                    <ListItem className={classes.item} key={status.type}>
                        <Icons.UserPlus className={classes.icon} size={16} />
                        <Typography className={classes.text}>
                            <RedPacketTrans.follow_somebody_on_somewhere
                                values={{
                                    handles: handles.join(', '),
                                    platform,
                                }}
                                components={{
                                    handles:
                                        platform ?
                                            <span>
                                                {handles.map((handle) => (
                                                    <Link
                                                        href={resolveProfileUrl(platform, handle)}
                                                        target='_blank'
                                                        key={handle}>
                                                        @{handle}
                                                    </Link>
                                                ))}
                                            </span>
                                        :   <span />,
                                }}
                            />
                        </Typography>
                        {showResults ?
                            <ResultIcon className={classes.state} size={18} result={status.result} />
                        :   null}
                    </ListItem>
                )
            }
            if (status.type === 'postReaction') {
                // discard `collect` for now
                let hasRepostCondition = false
                const conditions = status.result.conditions.filter((x) => x.key !== 'collect')
                return conditions
                    .reduce((arr: typeof conditions, condition) => {
                        if (condition.key === 'quote' || condition.key === 'repost') {
                            if (hasRepostCondition) return arr
                            hasRepostCondition = true
                            return [...arr, { ...condition, key: 'repost' }] as typeof conditions
                        }
                        return [...arr, condition]
                    }, [])
                    .map((condition) => {
                        const Icon = IconMap[condition.key]
                        return (
                            <ListItem className={classes.item} key={condition.key}>
                                <Icon className={classes.icon} size={16} />
                                <Typography className={classes.text}>{condition.key}</Typography>
                                <Link href={link.toString()} className={classes.link} target="_blank">
                                    <Icons.LinkOut size={16} className={classes.linkIcon} />
                                </Link>
                                {showResults ?
                                    <ResultIcon className={classes.state} size={18} result={condition.value} />
                                :   null}
                            </ListItem>
                        )
                    })
            }
            if (status.type === 'nftOwned') {
                const collectionNames = status.payload.map((x) => x.collectionName).join(', ')
                return (
                    <ListItem className={classes.item} key={status.type}>
                        <Icons.FireflyNFT className={classes.icon} size={16} />
                        <Typography className={classes.text}>NFT Holder of {collectionNames}</Typography>
                        <Typography className={classes.text}>
                            {t.nft_holder_of({
                                names: collectionNames,
                            })}
                        </Typography>
                        {showResults ?
                            <ResultIcon className={classes.state} size={18} result={status.result} />
                        :   null}
                    </ListItem>
                )
            }
            return null
        })
    }, [statusList, platform, showResults])
    return (
        <Box {...props} className={cx(classes.box, props.className)} ref={ref}>
            <Typography variant="h2" className={classes.header}>
                {t.requirements()}
                <IconButton
                    className={classes.closeButton}
                    disableRipple
                    onClick={() => onClose?.()}
                    aria-label="Close">
                    <Icons.Close size={24} />
                </IconButton>
            </Typography>
            <List className={classes.list}>{requirements}</List>
        </Box>
    )
})