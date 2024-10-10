import { ShadowRootTooltip, TextOverflowTooltip, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatTrait } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { Rank } from './Rank.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: 12,
    },
    titleBox: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    rankBox: {
        display: 'flex',
    },
    title: {
        fontSize: 20,
        lineHeight: '24px',
        fontWeight: 700,
        marginBottom: 12,
        color: theme.palette.maskColor.publicMain,
    },
    content: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
    },
    traitsItem: {
        padding: 12,
        width: 'calc(100%/3 - 8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        marginBottom: 12,
        background: theme.palette.maskColor.bg,
        borderRadius: 8,
        boxSizing: 'border-box',
    },
    traitTitle: {
        whiteSpace: 'nowrap',
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: 400,
        color: theme.palette.maskColor.second,
    },
    traitValue: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    traitRarity: {},
    unset: {
        color: 'unset',
    },
}))

interface PropertiesCardProps {
    asset: Web3Helper.NonFungibleAssetScope
    rank?: number
    timeline?: boolean
}

export function PropertiesCard(props: PropertiesCardProps) {
    const { asset, rank, timeline } = props
    const { classes, cx } = useStyles()

    if (!asset.traits?.length) return null

    return (
        <div className={classes.wrapper}>
            <div className={classes.titleBox}>
                <Typography className={timeline ? cx(classes.title, classes.unset) : classes.title}>
                    <Trans>Properties</Trans>
                </Typography>
                {rank ?
                    <div className={classes.rankBox}>
                        <Rank rank={rank} />
                    </div>
                :   null}
            </div>
            <div className={classes.content}>
                {asset.traits.map((trait, i) => {
                    const uiValue = formatTrait(trait)
                    return (
                        <div key={i} className={classes.traitsItem}>
                            <TextOverflowTooltip title={trait.type} as={ShadowRootTooltip} placement="top">
                                <Typography className={classes.traitTitle}>{trait.type}</Typography>
                            </TextOverflowTooltip>
                            <TextOverflowTooltip title={trait.value} as={ShadowRootTooltip}>
                                <Typography className={classes.traitValue}>{uiValue}</Typography>
                            </TextOverflowTooltip>
                            {typeof trait.rarity === 'string' ?
                                <Typography className={classes.traitRarity}>({trait.rarity})</Typography>
                            :   null}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
