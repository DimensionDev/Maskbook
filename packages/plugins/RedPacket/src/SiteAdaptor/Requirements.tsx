import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { MaskColors, makeStyles } from '@masknet/theme'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { Box, IconButton, List, ListItem, Typography, type BoxProps, Link } from '@mui/material'
import { sortBy } from 'lodash-es'
import { forwardRef, useMemo } from 'react'
import { useRedPacketTrans } from '../locales/i18n_generated.js'
import { usePostLink } from '@masknet/plugin-infra/content-script'

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
        fontWeight: 400,
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
        textTransform: 'capitalize',
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
}

export const Requirements = forwardRef<HTMLDivElement, Props>(function Requirements(
    { onClose, statusList, ...props }: Props,
    ref,
) {
    const t = useRedPacketTrans()
    const { classes, cx } = useStyles()
    const link = usePostLink()
    const requirements = useMemo(() => {
        const orders = ['profileFollow', 'postReaction', 'nftOwned'] as const
        const orderedStatusList = sortBy(statusList, (x) => orders.indexOf(x.type))
        return orderedStatusList.flatMap((status) => {
            if (status.type === 'profileFollow') {
                const payload = status.payload.filter((x) => x.platform === 'lens')
                const handles = payload.map((x) => `@${x.handle}`).join(', ')
                return (
                    <ListItem className={classes.item} key={status.type}>
                        <Icons.UserPlus className={classes.icon} size={16} />
                        <Typography className={classes.text}>
                            {t.follow_somebody_on_somewhere({
                                handles,
                                platform: payload[0].platform,
                            })}
                        </Typography>
                        <ResultIcon className={classes.state} size={18} result={status.result} />
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
                    .map((condition) => (
                        <ListItem className={classes.item} key={condition.key}>
                            <Icons.Heart className={classes.icon} size={16} />
                            <Typography className={classes.text}>{condition.key}</Typography>
                            <Link href={link.toString()} classes={classes.link} target="_blank">
                                <Icons.LinkOut size={16} className={classes.linkIcon} />
                            </Link>
                            <ResultIcon className={classes.state} size={18} result={condition.value} />
                        </ListItem>
                    ))
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
                        <ResultIcon className={classes.state} size={18} result={status.result} />
                    </ListItem>
                )
            }
            return null
        })
    }, [statusList, link])
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
