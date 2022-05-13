import { useValueRef } from '@masknet/shared-base-ui'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Typography, styled, Portal } from '@mui/material'
import classNames from 'classnames'
import { PropsWithChildren, useRef, cloneElement, useEffect, ReactElement, useState } from 'react'
import { sayHelloShowed, userGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { useI18N } from '../../utils'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'absolute',
        boxShadow: `0 0 0 3000px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,.3)' : 'rgba(110,118,125,.3)'}`,
        borderRadius: 8,
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
        background: 'rgba(0,0,0,.85)',
        boxShadow: '0 4px 8px rgba(0,0,0,.1)',
        boxSizing: 'border-box',
        color: '#fff',
        '&.arrow-top:after': {
            content: '""',
            display: 'inline-block',
            width: 0,
            height: 0,
            border: 'solid 8px transparent',
            borderBottomColor: 'rgba(0,0,0,.85)',
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
            borderTopColor: 'rgba(0,0,0,.85)',
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
}))

const ActionButton = styled('div')(({ theme }) => ({
    boxSizing: 'border-box',
    width: 104,
    height: 32,
    lineHeight: '32px',
    borderRadius: 16,
    textAlign: 'center',
    border: 'solid 1px #000',
    borderColor: '#fff',
    cursor: 'pointer',
    fontFamily: 'PingFang SC',
}))

const NextButton = styled(ActionButton)({
    border: 'none',
    color: '#111418',
    background: '#fff',
})

export interface GuideStepProps extends PropsWithChildren<{}> {
    total: number
    step: number
    tip: string
    arrow?: boolean
    disabled?: boolean
    onComplete?: () => void
}

export default function GuideStep({
    total,
    step,
    tip,
    children,
    arrow = true,
    disabled = false,
    onComplete,
}: GuideStepProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const childrenRef = useRef<HTMLElement>()
    const [clientRect, setClientRect] = useState<any>({})
    const [open, setOpen] = useState(false)
    const [bottomAvailable, setBottomAvailable] = useState(true)
    const ui = activatedSocialNetworkUI
    const lastStepRef = userGuideStatus[ui.networkIdentifier]
    const lastStep = useValueRef(lastStepRef)

    useEffect(() => {
        if (disabled) return
        const open = +lastStep === step
        setOpen(open)

        if (!open) return
        const url = new URL(location.href)
        if (url.pathname === '/home') return
        url.pathname = '/home'
        location.href = url.href
    }, [lastStep])

    useEffect(() => {
        if (disabled) return
        document.body.style.overflow = open ? 'hidden' : ''
    }, [open])

    const onSkip = () => {
        setOpen(false)
        userGuideStatus[ui.networkIdentifier].value = 'completed'
        sayHelloShowed[ui.networkIdentifier].value = true
    }

    const onNext = () => {
        setOpen(false)
        if (step !== total) {
            userGuideStatus[ui.networkIdentifier].value = String(step + 1)
        }
    }

    const onTry = () => {
        setOpen(false)
        userGuideStatus[ui.networkIdentifier].value = 'completed'
        onComplete?.()
    }

    useEffect(() => {
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
            } else {
                setClientRect(cr)
            }
        }

        onResize()

        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [childrenRef, lastStep, open])

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
                                        className={classNames(
                                            classes.card,
                                            arrow ? (bottomAvailable ? 'arrow-top' : 'arrow-bottom') : '',
                                        )}
                                        style={{
                                            left: clientRect.width < 50 ? -clientRect.width / 2 : 0,
                                            [bottomAvailable ? 'top' : 'bottom']: clientRect.height + 16,
                                        }}>
                                        <div style={{ paddingBottom: '16px' }}>
                                            <Typography sx={{ fontSize: 20 }}>
                                                {step}/{total}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography fontSize={14} fontWeight={600}>
                                                {tip}
                                            </Typography>
                                        </div>
                                        <div className={classes.buttonContainer}>
                                            {step === total ? (
                                                <NextButton style={{ width: '100%' }} onClick={onTry}>
                                                    {t('ok')}
                                                </NextButton>
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
