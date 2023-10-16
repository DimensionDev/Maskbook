import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: theme.spacing(2),
        paddingLeft: 0,
        margin: 0,
    },
    wordCard: {
        backgroundColor: theme.palette.maskColor.bg,
        padding: theme.spacing(1),
        borderRadius: 8,
        listStyleType: 'decimal',
        listStylePosition: 'inside',
        position: 'relative',
        '&::marker': {
            backgroundColor: theme.palette.maskColor.bg,
            color: theme.palette.maskColor.third,
            fontSize: 14,
        },
    },
    text: {
        width: '100%',
        position: 'absolute',
        left: 0,
        top: 8,
        display: 'flex',
        justifyContent: 'center',
        fontSize: 14,
    },
}))

interface WordsProps extends withClasses<'container' | 'wordCard' | 'text'> {
    words: string[]
}

export const Words = memo<WordsProps>(function Words({ words, ...props }) {
    const { classes } = useStyles(undefined, { props })

    return (
        <Box component="ul" className={classes.container}>
            {words.map((item, index) => (
                <Box className={classes.wordCard} component="li" key={index}>
                    <Typography className={classes.text} component="span" fontWeight={700}>
                        {item}
                    </Typography>
                </Box>
            ))}
        </Box>
    )
})
