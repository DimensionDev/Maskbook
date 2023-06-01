import { makeStyles } from '@masknet/theme'
import { Grid, Typography } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    wordCard: {
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing(1),
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        borderRadius: 8,
    },
    index: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.maskColor.third,
    },
}))

export const Words = memo(function Words({ words }: { words: string[] }) {
    const { classes } = useStyles()

    return (
        <Grid container spacing={2}>
            {words.map((item, index) => (
                <Grid item xs={3} key={index}>
                    <Typography className={classes.wordCard}>
                        <Typography component="span" className={classes.index}>
                            {index + 1}.
                        </Typography>
                        <Typography component="span" fontWeight={700}>
                            {item}
                        </Typography>
                    </Typography>
                </Grid>
            ))}
        </Grid>
    )
})
