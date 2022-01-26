import { Box } from '@mui/material'
import type { Part } from '../types'
import type { SxProps } from '@mui/system'
import type { Theme } from '@mui/material/styles'
import { makeStyles } from '@masknet/theme'
import { PartType } from '../types'

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

const PartZIndex: Record<PartType, number> = {
    [PartType.Background]: 1,
    [PartType.Skin]: 2,
    [PartType.Clothes]: 3,
    [PartType.Head]: 4,
    [PartType.Mask]: 5,
}

interface FusionFtgProps {
    parts: Part[]
    sx?: SxProps<Theme>
}
export default function FusionFtg(props: FusionFtgProps) {
    const { parts, sx } = props
    const { classes } = useStyles()

    return (
        <Box className={classes.box} sx={{ ...sx }}>
            {parts.map((part) => (
                <img
                    className={classes.part}
                    key={part.tokenId}
                    src={part.img}
                    style={{ zIndex: PartZIndex[part.type] }}
                />
            ))}
        </Box>
    )
}
