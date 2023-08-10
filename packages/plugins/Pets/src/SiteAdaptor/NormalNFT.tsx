import { useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { useStyles as useBoxStyles } from './PreviewBox.js'
import Drag from './Drag.js'
import type { ShowMeta } from '../types.js'
import { CloseIcon } from '../constants.js'
import { Image } from '@masknet/shared'

const useStyles = makeStyles()(() => ({
    imgContent: {
        zIndex: 999,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imgBox: {
        textAlign: 'center',
        width: '80%',
        height: '80%',
        display: 'flex',
        justifyContent: 'center',
    },
    close: {
        width: 15,
        height: 15,
        cursor: 'pointer',
        backgroundSize: 'contain',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 99,
    },
    wordContent: {
        display: 'flex',
        justifyContent: 'center',
    },
    wordBox: {
        position: 'absolute',
        maxWidth: 150,
        bottom: 150,
    },
}))

interface NormalNFTProps {
    start: boolean
    infoShow: boolean
    showMeta: ShowMeta | undefined
    handleClose: () => void
}

function handleMenuShow(e: React.MouseEvent) {
    e.preventDefault()
}
export function NormalNFT(props: NormalNFTProps) {
    const { start, infoShow, showMeta, handleClose } = props
    const { classes, cx } = useStyles()
    const { classes: boxClasses } = useBoxStyles()

    const [position, setPosition] = useState({ x: 50, y: 150 })
    const moveHandle = (x: number, y: number) => {
        setPosition({ x, y })
    }

    return (
        <Drag moveHandle={moveHandle} baseWidth={150} baseHeight={150}>
            {start && showMeta?.word ? (
                <Box className={classes.wordContent}>
                    <Box
                        className={cx(
                            {
                                [boxClasses.msgBox]: true,
                                [boxClasses.wordShow]: true,
                            },
                            classes.wordBox,
                        )}>
                        {showMeta?.word}
                    </Box>
                </Box>
            ) : null}
            <Box className={classes.imgContent} onContextMenu={handleMenuShow}>
                <div className={classes.imgBox}>
                    <Image
                        src={showMeta?.image ?? ''}
                        style={{
                            objectFit: 'contain',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            borderRadius: 10,
                            alignSelf: 'center',
                        }}
                    />
                </div>
            </Box>
            {infoShow ? (
                <div className={classes.close} onClick={handleClose} style={{ backgroundImage: `url(${CloseIcon})` }} />
            ) : null}
        </Drag>
    )
}
