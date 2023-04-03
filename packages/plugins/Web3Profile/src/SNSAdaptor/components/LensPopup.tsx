import { memo, useEffect, useState, useRef } from 'react'
import { makeStyles } from '@masknet/theme'
import type { LensAccount } from '@masknet/web3-providers'
import { emitter } from '../emitter.js'
import { isEqual } from 'lodash-es'
import { LensList } from './LensList.js'
import { useControlLensPopup } from '../hooks/Lens/useControlLensPopup.js'
import { Fade } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    popup: {
        position: 'absolute',
        zIndex: 99,
        borderRadius: 16,
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 4px 30px rgba(0, 0, 0, 0.1)'
                : '0px 4px 30px rgba(255, 255, 255, 0.15)',
    },
}))
export const LensPopup = memo(() => {
    const { classes } = useStyles()
    const holderRef = useRef<HTMLDivElement>(null)
    const [lens, setLens] = useState<LensAccount[]>([])
    const { style, active } = useControlLensPopup(holderRef)

    useEffect(() => {
        const unsubscribe = emitter.on('open', ({ lensAccounts }) => {
            setLens((oldAccounts) => {
                return isEqual(oldAccounts, lensAccounts) ? oldAccounts : lensAccounts
            })
        })
        return () => void unsubscribe()
    }, [])

    return (
        <Fade in={active} easing="linear" timeout={250}>
            <div className={classes.popup} ref={holderRef} style={style}>
                <LensList accounts={lens} />
            </div>
        </Fade>
    )
})

LensPopup.displayName = 'LensPopup'
