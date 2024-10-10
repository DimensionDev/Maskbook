import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Button, Portal, Typography } from '@mui/material'
import {
    cloneElement,
    createContext,
    useLayoutEffect,
    useState,
    type ReactElement,
    type ReactNode,
    type Ref,
} from 'react'

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
        backgroundColor: theme.palette.maskColor.bottom,
        color: theme.palette.maskColor.main,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.bottom,
        },
    },
}))

interface GuideStepProps {
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    children: ReactElement<{ ref: Ref<HTMLElement | null> }>
    step: number
    totalStep: number
    arrow?: boolean
    finished?: boolean
    currentStep: number
    title: ReactNode
    actionText: ReactNode
    onNext?: () => void
}

export function PluginGuide({
    children,
    step,
    totalStep,
    arrow = true,
    finished = false,
    title,
    actionText,
    currentStep,
    onNext,
}: GuideStepProps) {
    const { classes, cx } = useStyles()
    const [childrenRef, setChildrenRef] = useState<HTMLElement | null>(null)

    const [clientRect, setClientRect] = useState<any>({})
    const [bottomAvailable, setBottomAvailable] = useState(true)

    const targetVisible = !!clientRect.top && !!clientRect.left && !!clientRect.height && clientRect.width
    const stepVisible = !finished && currentStep === step && targetVisible

    useLayoutEffect(() => {
        document.documentElement.style.overflow = stepVisible ? 'hidden' : ''
        document.documentElement.style.paddingLeft = 'calc(100vw - 100%)'
    }, [stepVisible])

    useLayoutEffect(() => {
        if (finished) return

        const updateClientRect = () => {
            const cr = childrenRef?.getBoundingClientRect()

            if (cr) {
                const bottomAvailable = window.innerHeight - cr.height - cr.top > 200
                // eslint-disable-next-line react/hooks-extra/no-direct-set-state-in-use-effect
                setBottomAvailable(bottomAvailable)
                if (!cr.width) {
                    // eslint-disable-next-line react/hooks-extra/no-direct-set-state-in-use-effect
                    setClientRect({ ...cr.toJSON(), top: 30, left: 'calc(100vw - 300px)' })
                } else {
                    // eslint-disable-next-line react/hooks-extra/no-direct-set-state-in-use-effect
                    setClientRect(cr)
                }
            }
        }
        updateClientRect()

        window.addEventListener('resize', updateClientRect)
        return () => window.removeEventListener('resize', updateClientRect)
    }, [childrenRef, finished])

    return (
        <>
            {cloneElement(children, { ref: (ref: any) => setChildrenRef(ref) })}
            {usePortalShadowRoot((container) => {
                if (!stepVisible) return null
                return (
                    <Portal container={container} ref={() => {}}>
                        <div
                            className={classes.mask}
                            onClick={(e) => {
                                e.stopPropagation()
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
                                            arrow ?
                                                bottomAvailable ? 'arrow-top'
                                                :   'arrow-bottom'
                                            :   '',
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
                                            <Button color="primary" className={classes.button} onClick={onNext}>
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
