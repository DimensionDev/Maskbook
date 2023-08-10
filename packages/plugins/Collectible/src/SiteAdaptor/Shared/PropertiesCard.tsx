import format from 'date-fns/format'
import isAfter from 'date-fns/isAfter'
import isValid from 'date-fns/isValid'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Typography } from '@mui/material'
import { Rank } from './Rank.js'
import { useI18N } from '../../locales/i18n_generated.js'

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

export interface PropertiesCardProps {
    asset: Web3Helper.NonFungibleAssetScope
    rank?: number
    timeline?: boolean
}

function isReasonableDate(value: string | number) {
    const date = new Date(value)
    if (!isValid(date)) return false
    // 2015.7.30, Ethereum's birthday
    return isAfter(date, new Date(2015, 7, 30))
}

export function PropertiesCard(props: PropertiesCardProps) {
    const { asset, rank, timeline } = props
    const { classes, cx } = useStyles()
    const t = useI18N()

    if (!asset.traits?.length) return null

    return (
        <div className={classes.wrapper}>
            <div className={classes.titleBox}>
                <Typography className={timeline ? cx(classes.title, classes.unset) : classes.title}>
                    {t.plugin_collectible_properties()}
                </Typography>
                {rank ? (
                    <div className={classes.rankBox}>
                        <Rank rank={rank} />
                    </div>
                ) : null}
            </div>
            <div className={classes.content}>
                {asset.traits?.map((x, i) => (
                    <div key={i} className={classes.traitsItem}>
                        <Typography className={classes.traitTitle}>{x.type}</Typography>
                        <Typography className={classes.traitValue} title={x.value}>
                            {isReasonableDate(x.value) ? format(new Date(x.value), 'yyyy-MM-dd') : x.value}
                        </Typography>
                        {typeof x.rarity === 'string' ? (
                            <Typography className={classes.traitRarity}>({x.rarity})</Typography>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    )
}
