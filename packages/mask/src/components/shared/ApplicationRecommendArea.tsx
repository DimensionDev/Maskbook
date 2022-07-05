import { Box } from '@mui/material'
import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import type { Application } from './ApplicationSettingPluginList'
import { CarouselProvider, Slider, Slide } from 'pure-react-carousel'

const useStyles = makeStyles()(() => {
    return {
        recommendFeatureAppListWrapper: {
            display: 'flex',
            overflowX: 'scroll',
            margin: '0 2px 5px 2px',
            padding: '8px 2px 0 2px',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        carousel: {
            position: 'relative',
            zIndex: 100,
            height: 270,
            overflowX: 'scroll',
            overscrollBehavior: 'contain',
            '& .carousel__slider': {
                padding: '8px 4px 0',
                height: 270,
                overscrollBehavior: 'contain',
                overflowX: 'scroll',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            },
        },
    }
})

interface Props {
    recommendFeatureAppList: Application[]
    RenderEntryComponent: (props: { application: Application }) => JSX.Element
    isCarouselReady: () => boolean | null
}

export function ApplicationRecommendArea(props: Props) {
    const { recommendFeatureAppList, RenderEntryComponent, isCarouselReady } = props
    const { classes, cx } = useStyles()
    const [isPlaying, setIsPlaying] = useState(true)

    return (
        <>
            <link rel="stylesheet" href={new URL('./assets/react-carousel.es.css', import.meta.url).toString()} />
            {recommendFeatureAppList.length > 2 && isCarouselReady() ? (
                <CarouselProvider
                    naturalSlideWidth={290}
                    naturalSlideHeight={117}
                    totalSlides={recommendFeatureAppList.length}
                    visibleSlides={2.25}
                    infinite={false}
                    interval={2500}
                    className={classes.carousel}
                    isPlaying={isPlaying}>
                    <Slider onScroll={(e) => setIsPlaying((e.target as HTMLDivElement).scrollLeft === 0)}>
                        {recommendFeatureAppList.map((application, i) => (
                            <Slide index={i} key={application.entry.ApplicationEntryID}>
                                <RenderEntryComponent application={application} />
                            </Slide>
                        ))}
                    </Slider>
                </CarouselProvider>
            ) : (
                <Box className={classes.recommendFeatureAppListWrapper}>
                    {recommendFeatureAppList.map((application) => (
                        <RenderEntryComponent key={application.entry.ApplicationEntryID} application={application} />
                    ))}
                </Box>
            )}
        </>
    )
}
