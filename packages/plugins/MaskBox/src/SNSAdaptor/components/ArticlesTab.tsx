import { makeStyles } from '@masknet/theme'
import { type BoxMetadata, MediaType } from '../../type.js'
import { Box } from '@mui/material'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { Video } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    main: {
        padding: 16,
    },
    hero: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 360,
        objectFit: 'scale-down',
    },
}))

export interface ArticlesTabProps {
    boxMetadata?: BoxMetadata
}

export function ArticlesTab(props: ArticlesTabProps) {
    const { boxMetadata } = props
    const { classes } = useStyles()

    return (
        <Box className={classes.main}>
            <Box>
                {(() => {
                    if (!boxMetadata?.mediaType)
                        return (
                            <img
                                className={classes.hero}
                                src={new URL('../../assets/FallbackImage.svg', import.meta.url).toString()}
                            />
                        )
                    switch (boxMetadata.mediaType) {
                        case MediaType.Video:
                            return (
                                <Video
                                    VideoProps={{ className: classes.hero, controls: true }}
                                    src={resolveIPFS_URL(boxMetadata?.mediaUrl) ?? ''}
                                />
                            )
                        default:
                            return (
                                <img
                                    className={classes.hero}
                                    src={
                                        boxMetadata?.mediaUrl
                                            ? resolveIPFS_URL(boxMetadata?.mediaUrl)
                                            : new URL('../../assets/FallbackImage.svg', import.meta.url).toString()
                                    }
                                />
                            )
                    }
                })()}
            </Box>
        </Box>
    )
}
