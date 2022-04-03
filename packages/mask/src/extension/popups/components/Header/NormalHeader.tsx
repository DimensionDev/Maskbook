import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { MaskNotSquareIcon, SquareBack } from '@masknet/icons'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles()(() => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        padding: 16,
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
    },
    back: {
        fill: 'none',
        position: 'absolute',
        left: 16,
        top: 16,
    },
    title: {
        fontSize: 14,
        lineHeight: '18px',
        color: '#15181B',
        fontWeight: 700,
    },
    logo: {
        width: 104,
        height: 30,
    },
}))

export interface TitleHeaderProps {
    title: string
}

export const NormalHeader = memo<TitleHeaderProps>(({ title }) => {
    const { classes } = useStyles()
    const navigate = useNavigate()
    return (
        <Box className={classes.container} style={{ justifyContent: history.length !== 1 ? 'center' : 'flex-start' }}>
            {history.length !== 1 ? (
                <SquareBack className={classes.back} onClick={() => navigate(-1)} />
            ) : (
                <MaskNotSquareIcon className={classes.logo} />
            )}
            <Typography className={classes.title}>{title}</Typography>
        </Box>
    )
})
