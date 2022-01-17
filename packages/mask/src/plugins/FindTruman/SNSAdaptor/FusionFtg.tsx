import { Box } from '@mui/material'
import type { Part } from '../types'
import type { SxProps } from '@mui/system'
import type { Theme } from '@mui/material/styles'
import { makeStyles } from '@masknet/theme'
import { useContext } from 'react'
import { FindTrumanContext } from '../context'

const useStyles = makeStyles()((theme, props) => ({
    box: {
        width: '200px',
        height: '200px',
        borderRadius: '8px',
        position: 'relative',
        background: 'rgba(255, 255, 255, .15)',
        transition: 'all .3s',
        '&:hover': {
            transform: 'scale(1.05)',
        },
    },
    part: {
        width: '200px',
        height: '200px',
        position: 'absolute',
        top: 0,
        left: 0,
    },
}))

interface FusionFtgProps {
    parts: Part[]
    sx?: SxProps<Theme>
}
export default function FusionFtg(props: FusionFtgProps) {
    const { parts, sx } = props
    const { classes } = useStyles()
    const { const: consts } = useContext(FindTrumanContext)

    return (
        <Box className={classes.box} sx={{ ...sx }}>
            {parts.map((part, index) => (
                <img className={classes.part} key={part.tokenId} src={part.img} style={{ zIndex: index + 1 }} />
            ))}
            <img className={classes.part} src={consts?.ftgPartLogoImg} style={{ zIndex: 10 }} />
        </Box>
    )
}
