import { cloneElement, useRef, useState, type ReactElement, useLayoutEffect, type RefObject, type ReactNode } from 'react'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Box, Modal, styled, Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    container: {
        position: 'absolute',
        boxShadow: '0 0 0 3000px rgba(0,0,0,.3)',
        ...theme.applyStyles('dark', { boxShadow: '0 0 0 3000px rgba(110,118,125,.3)' }),
        borderRadius: 8,
    },
    noBoxShadowCover: {
        boxShadow: '0 0 0 3000px rgba(0,0,0,.2)',
        ...theme.applyStyles('dark', { boxShadow: '0 0 0 3000px rgba(110,118,125,.2)' }),
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

const ActionButton = styled('button')({
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
    background: 'none',
    color: 'inherit',
})

const NextButton = styled(ActionButton)({
    border: 'none',
    color: '#111418',
    background: '#fff',
})

export interface GuideStepProps {
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    children: ReactElement<{ ref: RefObject<HTMLElement | undefined> }>
    total: number
    step: number
    tip: ReactNode
    arrow?: boolean
    /** Whether this step is the currently active, unfinished guide step. */
    visible: boolean
    skipLabel?: ReactNode
    nextLabel?: ReactNode
    tryLabel?: ReactNode
    onSkip: () => void
    onNext: () => void
    onTry: () => void
}

/**
 * The onboarding tooltip overlay injected next to a highlighted element on every site adaptor.
 * Pure UI: whether the step is visible and what happens on Skip/Next/Try are all supplied by the caller,
 * which owns the actual guide progress (see packages/mask/content-script/components/GuideStep).
 */
export function GuideStep({
    total,
    step,
    tip,
    children,
    arrow = true,
    visible,
    skipLabel = 'Skip',
    nextLabel = 'Next',
    tryLabel = 'Try',
    onSkip,
    onNext,
    onTry,
}: GuideStepProps) {
    const { classes, cx } = useStyles()
    const childrenRef = useRef<HTMLElement>(undefined)
    const [clientRect, setClientRect] = useState<Pick<DOMRect, 'width' | 'height' | 'top' | 'left'>>()
    const [bottomAvailable, setBottomAvailable] = useState(true)

    const box1Ref = useRef<HTMLDivElement>(null)
    const box2Ref = useRef<HTMLDivElement>(null)
    const box3Ref = useRef<HTMLDivElement>(null)

    const stepVisible = visible && !!clientRect?.top && !!clientRect.left

    useLayoutEffect(() => {
        let stopped = false
        requestAnimationFrame(function fn() {
            if (stopped) return
            requestAnimationFrame(fn)
            if (!childrenRef.current) return
            const cr = childrenRef.current.getBoundingClientRect()
            if (!cr.height) return
            const bottomAvailable = window.innerHeight - cr.height - cr.top > 200
            setBottomAvailable(bottomAvailable)
            setClientRect((old) => {
                if (
                    old &&
                    (old.height === cr.height || old.left === cr.left || old.top === cr.top || old.width === cr.width)
                )
                    return old
                return cr
            })
            if (box1Ref.current) {
                box1Ref.current.style.top = `${cr.top}px`
                box1Ref.current.style.left = `${cr.left}px`
            }
            if (box2Ref.current) {
                box2Ref.current.style.width = `${cr.width}px`
                box2Ref.current.style.height = `${cr.height}px`
            }
            if (box3Ref.current) {
                box3Ref.current.style.left = `${cr.width < 50 ? -cr.width / 2 : 0}px`
                box3Ref.current.style.top = bottomAvailable ? `${cr.height + 16}px` : ''
                box3Ref.current.style.bottom = bottomAvailable ? '' : `${cr.height + 16}px`
            }
        })
        return () => void (stopped = true)
    }, [])
    // eslint-disable-next-line @eslint-react/no-clone-element
    const child = cloneElement(children, { ref: childrenRef })

    return (
        <>
            {child}
            {usePortalShadowRoot((container) => {
                if (!stepVisible) return null
                return (
                    <Modal open hideBackdrop container={container} className={classes.mask} onClose={onSkip}>
                        {/* this extra div is feed to <FocusTrap /> If we remove it, it will show a blue outline on the box1 */}
                        <div>
                            <div
                                ref={box1Ref}
                                className={cx(classes.container, step === 3 ? classes.noBoxShadowCover : null)}>
                                <Box ref={box2Ref} className={classes.target}>
                                    <div
                                        ref={box3Ref}
                                        className={cx(
                                            classes.card,
                                            arrow ?
                                                bottomAvailable ? 'arrow-top'
                                                :   'arrow-bottom'
                                            :   '',
                                        )}>
                                        <Box sx={{ paddingBottom: '16px' }}>
                                            <Typography sx={{ fontSize: 20 }}>
                                                {step}/{total}
                                            </Typography>
                                        </Box>
                                        <div>
                                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{tip}</Typography>
                                        </div>
                                        <div className={classes.buttonContainer}>
                                            {step === total ?
                                                <NextButton type="button" style={{ width: '100%' }} onClick={onTry}>
                                                    {tryLabel}
                                                </NextButton>
                                            :   <>
                                                    <ActionButton type="button" onClick={onSkip}>
                                                        {skipLabel}
                                                    </ActionButton>
                                                    <NextButton type="button" onClick={onNext}>
                                                        {nextLabel}
                                                    </NextButton>
                                                </>
                                            }
                                        </div>
                                    </div>
                                </Box>
                            </div>
                        </div>
                    </Modal>
                )
            })}
        </>
    )
}
