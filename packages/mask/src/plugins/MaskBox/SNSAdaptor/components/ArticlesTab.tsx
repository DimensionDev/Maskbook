import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { BoxInfo, BoxMetadata, MediaType } from '../../type.js'
import { MaskSharpIconOfSize } from '@masknet/shared'
import { Video } from '../../../../components/shared/Video.js'

const useStyles = makeStyles()((theme) => ({
    main: {
        padding: 16,
    },
    body: {
        width: '100%',
        height: 360,
        overflow: 'hidden',
        borderRadius: 8,
        boxSizing: 'border-box',
        border: `solid 1px ${theme.palette.divider}`,
    },
    footer: {
        margin: theme.spacing(2.75, 0),
    },
    hero: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 360,
        objectFit: 'scale-down',
    },
    name: {
        whiteSpace: 'nowrap',
        maxWidth: '50%',
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    icon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        width: 64,
        height: 64,
        opacity: 0.1,
    },
}))

export interface ArticlesTabProps {
    boxInfo: BoxInfo
    boxMetadata?: BoxMetadata
}

export function ArticlesTab(props: ArticlesTabProps) {
    const { boxInfo, boxMetadata } = props
    const { classes } = useStyles()

    return (
        <Box className={classes.main}>
            <Box className={classes.body}>
                {(() => {
                    if (!boxMetadata?.mediaType)
                        return (
                            <Box className={classes.hero}>
                                <MaskSharpIconOfSize classes={{ root: classes.icon }} size={22} />
                            </Box>
                        )
                    switch (boxMetadata.mediaType) {
                        case MediaType.Video:
                            return (
                                <Video
                                    VideoProps={{ className: classes.hero, controls: true }}
                                    src={boxMetadata.mediaUrl}
                                />
                            )
                        default:
                            return <img className={classes.hero} src={boxMetadata.mediaUrl} />
                    }
                })()}
            </Box>
        </Box>
    )
}
