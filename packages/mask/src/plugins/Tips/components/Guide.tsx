import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Typography, Portal, Button } from '@mui/material'
import { PropsWithChildren, useRef, cloneElement, useEffect, ReactElement, useState } from 'react'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { useI18N } from '../locales/index.js'
import { finishUserGuide, useTipsUserGuide } from '../storage/index.js'
import type { EnhanceableSite } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'absolute',
        borderRadius: '50%',
    },
    target: {
        background: 'transparent',
    },
    mask: {
        position: 'fixed',
        top: 0,
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        zIndex: 1000,
    },
    card: {
        position: 'absolute',
        left: 0,
        width: 256,
        padding: '16px',
        borderRadius: '16px',
        background: theme.palette.maskColor.tips,
        boxShadow: '0 4px 8px rgba(0,0,0,.1)',
        boxSizing: 'border-box',
        color: theme.palette.maskColor.bottom,
        '&.arrow-top:after': {
            content: '""',
            display: 'inline-block',
            width: 0,
            height: 0,
            border: 'solid 8px transparent',
            borderBottomColor: theme.palette.maskColor.tips,
            borderBottomWidth: '13px',
            borderTopWidth: 0,
            position: 'absolute',
            top: '-13px',
            left: '24px',
        },
        '&.arrow-bottom:after': {
            content: '""',
            display: 'inline-block',
            width: 0,
            height: 0,
            border: 'solid 8px transparent',
            borderTopColor: theme.palette.maskColor.tips,
            borderTopWidth: '13px',
            borderBottomWidth: 0,
            position: 'absolute',
            bottom: '-13px',
            left: '24px',
        },
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '16px',
    },
    button: {
        width: '100%',
        borderRadius: '20px',
    },
}))

export interface GuideStepProps extends PropsWithChildren<{}> {
    arrow?: boolean
    disabled?: boolean
    onComplete?: () => void
}

export default function Guide({ children, arrow = true, disabled = false, onComplete }: GuideStepProps) {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const childrenRef = useRef<HTMLElement>()
    const [clientRect, setClientRect] = useState<any>({})
    const [open, setOpen] = useState(false)
    const [bottomAvailable, setBottomAvailable] = useState(true)
    const ui = activatedSocialNetworkUI
    const enableUserGuide = ui.configuration.tipsConfig?.enableUserGuide
    const lastStep = useTipsUserGuide(ui.networkIdentifier as EnhanceableSite)

    useEffect(() => {
        if (disabled || !enableUserGuide || lastStep.finished) return
        setOpen(true)
    }, [])

    useEffect(() => {
        if (disabled || !enableUserGuide || lastStep.finished) return
        document.body.style.overflow = open ? 'hidden' : ''
    }, [open])

    const onNext = () => {
        setOpen(false)
        finishUserGuide(ui.networkIdentifier as EnhanceableSite)
    }

    useEffect(() => {
        if (disabled || !enableUserGuide || lastStep.finished) return
        const onResize = () => {
            const cr = childrenRef.current?.getBoundingClientRect()

            if (cr) {
                const bottomAvailable = window.innerHeight - cr.height - cr.top > 200
                setBottomAvailable(bottomAvailable)
                if (!cr.width) {
                    setClientRect({ ...cr, top: 30, left: 'calc(100vw - 300px)' })
                } else {
                    setClientRect(cr)
                }
            }
        }

        onResize()

        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [childrenRef, lastStep.finished])

    return (
        <>
            {cloneElement(children as ReactElement<any>, { ref: childrenRef })}
            {usePortalShadowRoot((container) => {
                if (!open) return null
                return (
                    <Portal container={container}>
                        <div
                            className={classes.mask}
                            onClick={(e) => {
                                e.stopPropagation()
                                setOpen(false)
                            }}>
                            <div
                                className={classes.container}
                                style={{
                                    top: clientRect.top,
                                    left: clientRect.left,
                                }}>
                                <Box
                                    className={classes.target}
                                    style={{
                                        width: clientRect.width,
                                        height: clientRect.height,
                                    }}>
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className={cx(
                                            classes.card,
                                            arrow ? (bottomAvailable ? 'arrow-top' : 'arrow-bottom') : '',
                                        )}
                                        style={{
                                            left: clientRect.width < 50 ? -clientRect.width / 2 + 5 : 0,
                                            [bottomAvailable ? 'top' : 'bottom']: clientRect.height + 16,
                                        }}>
                                        <div>
                                            <Typography fontSize={14} fontWeight={600}>
                                                {t.tips_guide_description()}
                                            </Typography>
                                        </div>
                                        <div className={classes.buttonContainer}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                className={classes.button}
                                                onClick={onNext}>
                                                {t.tips_guide_action()}
                                            </Button>
                                        </div>
                                    </div>
                                </Box>
                            </div>
                        </div>
                    </Portal>
                )
            })}
        </>
    )
}
