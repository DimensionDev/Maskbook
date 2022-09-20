import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { SourceType } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    gemRankWrapper: {
        boxSizing: 'border-box',
        borderRadius: 8,
        padding: '4px 8px',
        fontSize: 14,
        lineHeight: '18px',
        background: 'linear-gradient(89.76deg, #AA60EC 0.24%, #FFC846 99.83%)',
        fontWeight: 700,
        color: '#fff',
    },
}))

export interface RankProps {
    rank: number
}

export function Rank(props: RankProps) {
    const { rank } = props
    const { classes } = useStyles()

    return (
        <div className={classes.gemRankWrapper}>
            <Typography># {rank}</Typography>
        </div>
    )
}
