import { useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Box } from '@mui/material'
import classNames from 'classnames'
import Drag from './Drag'
import { getAssetAsBlobURL } from '../../../utils'
import ModelView from './ModelView'
import { useStyles as boxUseStyles } from './PreviewBox'
import { Punk3D } from '../constants'
import type { ShowMeta } from '../types'

const useStyles = makeStyles()(() => ({
    modelContent: {
        width: 250,
        height: 300,
    },
    dragImg: {
        width: 15,
        height: 15,
    },
    wordContent: {
        position: 'absolute',
        right: 40,
        marginTop: -340,
    },
    word: {
        width: '152px !important',
        maxHeight: 85,
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
    const DragIcon = getAssetAsBlobURL(new URL('../assets/drag.png', import.meta.url))
    const [position, setPosition] = useState({ x: 50, y: 150 })
    const moveHandle = (x: number, y: number) => {
        setPosition({ x, y })
    }
    return (
        <div>
            <ModelView
                styleContent={{
                    position: 'fixed',
                    right: position.x,
                    bottom: position.y,
                    width: 250,
                    height: 300,
                }}
                source={Punk3D.url}
            />
            <Drag moveHandle={moveHandle} baseWidth={40} baseHeight={40}>
                <div style={{ position: 'absolute' }}>
                    <img className={classes.dragImg} src={DragIcon} />
                </div>
                {start && showMeta?.word ? (
                    <Box className={classes.wordContent}>
                        <Box
                            className={classNames(classes.word, {
                                [boxClasses.msgBox]: true,
                                [boxClasses.wordShow]: true,
                            })}>
                            {showMeta?.word}
                        </Box>
                    </Box>
                ) : null}
            </Drag>
        </div>
    )
}
