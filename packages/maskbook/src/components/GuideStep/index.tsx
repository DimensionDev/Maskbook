import { useValueRef } from '@masknet/shared'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Portal, Typography, styled } from '@mui/material'
import classNames from 'classnames'
import { PropsWithChildren, useRef, cloneElement, useEffect, ReactElement, useState } from 'react'
import { currentSetupGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { useI18N } from '../../utils'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'absolute',
        boxShadow: '0 0 20px 3000px rgba(0,0,0,.5)',
    },
    target: {
        background: 'transparent',
        borderRadius: '4px',
    },
    mask: {
        position: 'fixed',
        top: 0,
        width: '100vw',
        height: '100vh',
        background: 'transparent',
    },
    card: {
        position: 'absolute',
        left: -10,
        width: 256,
        padding: '16px',
        borderRadius: '16px',
        background: theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 0.8)' : '#fff',
        color: theme.palette.mode === 'light' ? '#fff' : '#111432',
        '&.arrow:after': {
            content: '""',
            display: 'inline-block',
            width: 0,
            height: 0,
            border: 'solid 8px transparent',
            borderBottomColor: theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 0.8)' : '#fff',
            borderBottomWidth: '13px',
            borderTopWidth: 0,
            position: 'absolute',
            top: '-13px',
            left: '24px',
        },
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-evenly',
        paddingTop: '16px',
    },
}))

const ActionButton = styled('div')(({ theme }) => ({
    width: '80px',
    height: '26px',
    lineHeight: '26px',
    borderRadius: 15,
    textAlign: 'center',
    border: 'solid 1px #000',
    borderColor: theme.palette.mode === 'light' ? '#fff' : 'rgba(15, 20, 25, 0.8)',
    cursor: 'pointer',
}))

const NextButton = styled(ActionButton)({
    border: 'none',
    color: '#fff',
    background: '#1C68F3',
})

export interface GuideStepProps extends PropsWithChildren<{}> {
    total: number
    step: number
    tip: string
    arrow?: boolean
    onComplete?: () => void
}

export default function GuideStep({ total, step, tip, children, arrow = true, onComplete }: GuideStepProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const childrenRef = useRef<HTMLElement>()
    const [clientRect, setClientRect] = useState<any>({})
    const [open, setOpen] = useState(false)
    const ui = activatedSocialNetworkUI
    const lastStepRef = currentSetupGuideStatus[ui.networkIdentifier]
    const lastStep = useValueRef(lastStepRef)

    useEffect(() => {
        setOpen(+lastStep === step)
    }, [lastStep])

    const resetOverflow = () => {
        document.body.style.overflow = ''
    }

    const onSkip = () => {
        setOpen(false)
        resetOverflow()
        currentSetupGuideStatus[ui.networkIdentifier].value = ''
        localStorage.setItem('userGuideCompleted', 'true')
    }

    const onNext = () => {
        setOpen(false)
        resetOverflow()
        if (step !== total) {
            currentSetupGuideStatus[ui.networkIdentifier].value = String(step + 1)
        }
    }

    const onTry = () => {
        onSkip()
        onComplete?.()
    }

    useEffect(() => {
        const onResize = () => {
            const cr = childrenRef.current?.getBoundingClientRect()

            if (cr && !cr.width) {
                setClientRect({ ...cr, top: 30, left: 'calc(100vw - 300px)' })
            } else {
                setClientRect(cr)
            }
        }

        onResize()

        document.body.style.overflow = 'hidden'

        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [childrenRef])

    return (
        <>
            {cloneElement(children as ReactElement<any>, { ref: childrenRef })}
            {usePortalShadowRoot((container) => {
                if (!open) return null
                return (
                    <Portal container={container}>
                        <div className={classes.mask} onClick={(e) => e.stopPropagation()}>
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
                                        className={classNames(classes.card, arrow ? 'arrow' : '')}
                                        style={{
                                            top: clientRect.height + 16,
                                        }}>
                                        <div style={{ paddingBottom: '16px' }}>
                                            <Typography sx={{ fontSize: 20 }}>
                                                <span style={{ color: '#1C68F3' }}>{step}</span>/{total}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography>{tip}</Typography>
                                        </div>
                                        <div className={classes.buttonContainer}>
                                            {step === total ? (
                                                <NextButton onClick={onTry}>{t('trying')}</NextButton>
                                            ) : (
                                                <>
                                                    <ActionButton onClick={onSkip}>{t('skip')}</ActionButton>
                                                    <NextButton onClick={onNext}>{t('next')}</NextButton>
                                                </>
                                            )}
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
