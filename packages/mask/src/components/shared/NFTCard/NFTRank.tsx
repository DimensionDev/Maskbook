import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { SourceType } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
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

interface NFTRankProps {
    providerType?: SourceType
    rank: number
}

export function NFTRank(props: NFTRankProps) {
    const { providerType, rank } = props
    // todo: multiple style to provider
    const { classes } = useStyles()
    const _providerType = providerType || SourceType.Gem
    return (
        <div className={classes.wrapper}>
            <Typography># {rank ?? '-'}</Typography>
        </div>
    )
}
