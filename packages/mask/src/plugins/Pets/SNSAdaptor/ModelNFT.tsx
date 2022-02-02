import { useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Box } from '@mui/material'
import classNames from 'classnames'
import Drag from './Drag'
import ModelView from './ModelView'
import { useStyles as boxUseStyles } from './PreviewBox'
import { DragIcon } from '../constants'
import type { ShowMeta } from '../types'

const useStyles = makeStyles()(() => ({
    dragContent: {
        position: 'absolute',
        bottom: -25,
        right: 0,
    },
    dragImg: {
        width: 15,
        height: 15,
    },
    wordContent: {
        position: 'absolute',
        left: 12,
        bottom: 150,
    },
    word: {
        width: '152px !important',
        maxHeight: 85,
    },
    glbView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
    },
}))

interface ModelNFTProps {
    start: boolean
    showMeta: ShowMeta | undefined
}

export function ModelNFT(props: ModelNFTProps) {
    const { start, showMeta } = props
    const classes = useStylesExtends(useStyles(), {})
    const boxClasses = useStylesExtends(boxUseStyles(), {})
    const [position, setPosition] = useState({ x: 50, y: 150 })
    const moveHandle = (x: number, y: number) => {
        setPosition({ x, y })
    }

    return (
        <div>
            <div
                style={{
                    position: 'fixed',
                    right: position.x,
                    bottom: position.y,
                    zIndex: 100,
                    width: 200,
                    height: 150,
                }}>
                <div className={classes.glbView}>
                    <ModelView className={classes.glbView} source={showMeta?.image ?? ''} />
                </div>
            </div>
            <Drag moveHandle={moveHandle} baseWidth={200} baseHeight={150}>
                <div className={classes.dragContent}>
                    <img className={classes.dragImg} src={DragIcon} />
                </div>
                {start && showMeta?.word ? (
                    <Box className={classes.wordContent}>
                        <Box className={classNames(classes.word, boxClasses.msgBox, boxClasses.wordShow)}>
                            {showMeta?.word}
                        </Box>
                    </Box>
                ) : null}
            </Drag>
        </div>
    )
}
