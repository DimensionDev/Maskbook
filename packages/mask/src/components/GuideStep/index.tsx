import { cloneElement, type PropsWithChildren, type ReactElement, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-use'
import { debounce } from 'lodash-es'
import { useValueRef } from '@masknet/shared-base-ui'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Portal, styled, Typography } from '@mui/material'
import { sayHelloShowed, userGuideFinished, userGuideStatus } from '../../../shared/legacy-settings/settings.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { useI18N } from '../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'absolute',
        boxShadow: `0 0 0 3000px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,.3)' : 'rgba(110,118,125,.3)'}`,
        borderRadius: 8,
    },
    noBoxShadowCover: {
        boxShadow: `0 0 0 3000px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,.2)' : 'rgba(110,118,125,.2)'}`,
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
    onComplete?: () => void
}

export default function GuideStep({ total, step, tip, children, arrow = true, onComplete }: GuideStepProps) {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const childrenRef = useRef<HTMLElement>()
    const [clientRect, setClientRect] = useState<DOMRect>()
    const [bottomAvailable, setBottomAvailable] = useState(true)
    const { networkIdentifier } = activatedSocialNetworkUI
    const currentStep = useValueRef(userGuideStatus[networkIdentifier])
    const finished = useValueRef(userGuideFinished[networkIdentifier])
    const isCurrentStep = +currentStep === step

    const history = useLocation()

    const stepVisible = isCurrentStep && !finished && !!clientRect?.top && !!clientRect.left

    useEffect(() => {
        document.documentElement.style.overflow =
            stepVisible && Number.parseInt(currentStep, 10) === total ? 'hidden' : ''
        document.documentElement.style.paddingLeft = 'calc(100vw - 100%)'
    }, [stepVisible, currentStep])

    const onSkip = () => {
        sayHelloShowed[networkIdentifier].value = true
        userGuideFinished[networkIdentifier].value = true
    }

    const onNext = () => {
        if (step !== total) {
            userGuideStatus[networkIdentifier].value = String(step + 1)
        }
        if (step === total - 1) {
            document.body.scrollIntoView()
        }
    }

    const onTry = () => {
        userGuideFinished[networkIdentifier].value = true
        onComplete?.()
    }

    const [inserted, setInserted] = useState(false)
    useEffect(() => {
        const observer = new MutationObserver((_, observer) => {
            if (!childrenRef.current) return
            const cr = childrenRef.current.getBoundingClientRect()
            if (!cr.height) return
            setInserted(true)
            observer.disconnect()
        })
        observer.observe(document.body, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        const setGuideStepRect = () => {
            if (!inserted) return
            const cr = childrenRef.current?.getBoundingClientRect()
            if (cr) {
                const bottomAvailable = window.innerHeight - cr.height - cr.top > 200
                setBottomAvailable(bottomAvailable)
            }
            setClientRect(cr)
        }
        setGuideStepRect()

        const onResize = debounce(setGuideStepRect, 500)

        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [childrenRef.current, inserted, currentStep, history])

    const scrollWidth = (() => {
        if (stepVisible && Number.parseInt(currentStep, 10) === total) return 0
        const cWidth = document.documentElement.clientWidth || document.body.clientWidth
        return window.innerWidth - cWidth
    })()

    return (
        <>
            {cloneElement(children as ReactElement, { ref: childrenRef })}
            {usePortalShadowRoot((container) => {
                if (!stepVisible) return null
                return (
                    <Portal container={container}>
                        <div className={classes.mask} onClick={(e) => e.stopPropagation()}>
                            <div
                                className={cx(classes.container, step === 3 ? classes.noBoxShadowCover : null)}
                                style={{
                                    top: clientRect.top,
                                    left: clientRect.left - scrollWidth,
                                }}>
                                <Box
                                    className={classes.target}
                                    style={{
                                        width: clientRect.width,
                                        height: clientRect.height,
                                    }}>
                                    <div
                                        className={cx(
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
                                                    {t('try')}
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
