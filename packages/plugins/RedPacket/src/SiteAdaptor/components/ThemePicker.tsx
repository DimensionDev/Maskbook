import { alpha, Box, type BoxProps } from '@mui/material'
import { memo } from 'react'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { Icons } from '@masknet/icons'
import { MAX_CUSTOM_THEMES, RoutePaths } from '../../constants.js'
import { makeStyles } from '@masknet/theme'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles()((theme) => ({
    deleteButton: {
        cursor: 'pointer',
        position: 'absolute',
        right: 0,
        top: 0,
        opacity: 0,
        width: 20,
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.maskColor.bottom,
        backgroundColor: alpha(theme.palette.maskColor.main, 0.8),
        borderRadius: 4,
        padding: 0,
        border: 0,
    },
    cover: {
        position: 'relative',
        width: 60,
        height: 40,
        cursor: 'pointer',
        border: 'none',
        borderRadius: 4,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        '&:hover *': {
            opacity: 1,
        },
    },
    addButton: {
        width: 44,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.maskColor.thirdMain,
    },
    selectedCover: {
        boxShadow: `0 0 0 2px ${theme.palette.maskColor.main}`,
    },
}))

export const ThemePicker = memo<BoxProps>(function ThemePicker(props) {
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const { theme: selectedTheme, themes: redpacketThemes, customThemes, setCustomThemes, setTheme } = useRedPacket()

    return (
        <Box
            {...props}
            sx={[
                { display: 'flex', flexDirection: 'row', gap: 1, ml: 'auto' },
                ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
            ]}>
            {redpacketThemes.map((theme) => (
                <div
                    key={theme.tid}
                    role="button"
                    className={cx(classes.cover, theme.tid === selectedTheme?.tid ? classes.selectedCover : '')}
                    style={{
                        backgroundImage: `url("${encodeURI(theme.cover.bg_image)}")`,
                        backgroundColor: theme.cover.bg_color,
                    }}
                    onClick={() => {
                        setTheme(theme)
                    }}>
                    {customThemes.includes(theme) ?
                        <button
                            type="button"
                            className={classes.deleteButton}
                            onClick={(event) => {
                                event.stopPropagation()
                                setCustomThemes((origins) => origins.filter((x) => x !== theme))
                                if (theme === selectedTheme) setTheme(undefined)
                            }}>
                            <Icons.Delete size={16} />
                        </button>
                    :   null}
                </div>
            ))}
            {customThemes.length < MAX_CUSTOM_THEMES ?
                <button
                    type="button"
                    className={cx(classes.cover, classes.addButton)}
                    onClick={() => {
                        navigate(RoutePaths.CustomCover)
                    }}>
                    <Icons.Plus size={20} />
                </button>
            :   null}
        </Box>
    )
})
