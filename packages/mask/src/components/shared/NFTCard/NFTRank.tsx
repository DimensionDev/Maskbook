import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'

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

export function NFTRank() {
    // todo: multiple style to provider
    const { classes } = useStyles()
    return (
        <div className={classes.wrapper}>
            <Typography># 20875</Typography>
        </div>
    )
}
