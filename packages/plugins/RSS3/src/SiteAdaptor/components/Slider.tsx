import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { range } from 'lodash-es'
import { useState, useRef, type CSSProperties, type HTMLProps, useEffect, useLayoutEffect } from 'react'

const useStyles = makeStyles<void, 'active'>()((theme, _, refs) => ({
    container: {},
    slider: {
        width: '100%',
    },
    sliderWrapper: {
        transition: 'transform 0.2s ease-in-out',
        display: 'flex',
    },
    slide: {
        width: '100%',
    },
    sliderControllers: {
        display: 'flex',
    },
    indicators: {
        display: 'flex',
        gap: 1.5,
        margin: 'auto',
        [`.${refs.active}`]: {
            backgroundColor: theme.vars.palette.maskColor.second,
        },
    },
    indicator: {
        width: 3,
        height: 3,
        display: 'inline-block',
        borderRadius: '50%',
        backgroundColor: theme.vars.palette.maskColor.third,
    },
    active: {},
}))

interface Props extends HTMLProps<HTMLDivElement> {
    onUpdate?(index: number): void
    count: number
    items: React.ReactNode[]
}

export function Slider({ className, onUpdate, count, items, ...rest }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { classes, cx } = useStyles()
    const [index, setIndex] = useState(0)

    const [style, setStyle] = useState<CSSProperties>({})
    const [width, setWidth] = useState(0)
    useLayoutEffect(() => {
        if (!containerRef.current) return
        const offsetWidth = containerRef.current.offsetWidth
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- The rendered container width is an external layout measurement.
        setWidth(offsetWidth)
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- The transform must be recomputed from the external layout measurement.
        setStyle({
            width: offsetWidth * count,
            transform: `translate(${-offsetWidth * index}px, 0)`,
        })
    }, [count, index])

    useEffect(() => {
        onUpdate?.(index)
    }, [onUpdate, index])

    return (
        <div className={cx(classes.container, className)} ref={containerRef} {...rest}>
            <div className={classes.slider}>
                <div className={classes.sliderWrapper} style={style}>
                    {items.map((child, index) => (
                        <div key={index} className={classes.slide} style={{ width }}>
                            {child}
                        </div>
                    ))}
                </div>
            </div>
            <div className={classes.sliderControllers}>
                <Icons.LeftArrow
                    size={18}
                    onClick={(event) => {
                        event.stopPropagation()
                        setIndex((idx) => (((idx - 1) % count) + count) % count)
                    }}
                />
                <div className={classes.indicators}>
                    {range(count).map((idx) => {
                        return <i className={cx(classes.indicator, index === idx ? classes.active : null)} key={idx} />
                    })}
                </div>
                <Icons.RightArrow
                    size={18}
                    onClick={(event) => {
                        event.stopPropagation()
                        setIndex((idx) => (idx + 1) % count)
                    }}
                />
            </div>
        </div>
    )
}
