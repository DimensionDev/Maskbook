import type { PluginID } from '@masknet/shared-base'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Button, Portal, Typography } from '@mui/material'
import React, {
    cloneElement,
    createContext,
    type PropsWithChildren,
    type ReactElement,
    useContext,
    useEffect,
    useRef,
    useState,
    useMemo,
} from 'react'
import { usePluginGuideRecord } from './usePluginGuideRecord.js'

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
        padding: theme.spacing(2),
        borderRadius: theme.spacing(2),
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
        paddingTop: theme.spacing(2),
    },
    button: {
        width: '100%',
        borderRadius: '20px',
    },
}))

export interface GuideStepProps extends PropsWithChildren<{}> {
    step: number
    arrow?: boolean
    disabled?: boolean
}

export function PluginGuide({ children, arrow = true, disabled = false, step }: GuideStepProps) {
    const { classes, cx } = useStyles()
    const childrenRef = useRef<HTMLElement>()

    const [clientRect, setClientRect] = useState<any>({})
    const [open, setOpen] = useState(false)
    const [bottomAvailable, setBottomAvailable] = useState(true)
    const { nextStep, currentStep, finished, title, actionText, totalStep } = useContext(PluginGuideContext)

    useEffect(() => {
        if (disabled || finished || step !== currentStep) return
        setOpen(true)
    }, [currentStep])

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
    }, [open])

    const onNext = () => {
        setOpen(false)
        nextStep()
    }

    useEffect(() => {
        if (disabled || finished) return

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
    }, [childrenRef, finished])

    return (
        <>
            {cloneElement(children as ReactElement, { ref: childrenRef })}
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
                                        {totalStep !== 1 && (
                                            <div style={{ paddingBottom: '16px' }}>
                                                <Typography sx={{ fontSize: 20 }}>
                                                    {currentStep}/{totalStep}
                                                </Typography>
                                            </div>
                                        )}
                                        <div>
                                            <Typography fontSize={14} fontWeight={600}>
                                                {title}
                                            </Typography>
                                        </div>
                                        <div className={classes.buttonContainer}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                className={classes.button}
                                                onClick={onNext}>
                                                {actionText}
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

interface PluginGuideContext {
    title?: string
    actionText?: string
    finished: boolean
    currentStep: number
    totalStep: number
    nextStep: () => void
}
const PluginGuideContext = createContext<PluginGuideContext>(null!)

export function PluginGuideProvider({
    value,
    children,
}: React.ProviderProps<{
    pluginID: PluginID
    totalStep: number
    storageKey?: string
    onFinish?: () => void
    guides: Array<{
        title: string
        actionText: string
    }>
}>) {
    const { guides, totalStep, onFinish, storageKey = 'default', pluginID } = value
    const { currentStep, finished, nextStep } = usePluginGuideRecord(pluginID, totalStep, storageKey, onFinish)
    const title = guides[currentStep - 1]?.title
    const actionText = guides[currentStep - 1]?.actionText
    const context = useMemo(
        () => ({
            title,
            actionText,
            finished,
            currentStep,
            totalStep,
            nextStep,
        }),
        [title, actionText, finished, currentStep, totalStep, nextStep],
    )
    return <PluginGuideContext.Provider value={context}>{children}</PluginGuideContext.Provider>
}
