import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { range } from 'lodash-unified'
import { FC, Children, useState, useRef, CSSProperties, HTMLProps, useEffect } from 'react'

const useStyles = makeStyles<void, 'active'>()((theme, _, refs) => ({
    container: {},
    slider: {
        width: '100%',
        overflow: 'auto',
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
            backgroundColor: theme.palette.maskColor.second,
        },
    },
    indicator: {
        width: 3,
        height: 3,
        display: 'inline-block',
        borderRadius: '50%',
        backgroundColor: theme.palette.maskColor.third,
    },
    active: {},
}))

interface Props extends HTMLProps<HTMLDivElement> {
    onUpdate?(index: number): void
}

export const Slider: FC<Props> = ({ children, className, onUpdate, ...rest }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { classes, cx } = useStyles()
    const [index, setIndex] = useState(0)

    const count = Children.count(children)

    const style: CSSProperties = containerRef.current
        ? {
              width: containerRef.current.offsetWidth * count,
              transform: `translate(${-containerRef.current.offsetWidth * index}px, 0)`,
          }
        : {}

    useEffect(() => {
        onUpdate?.(index)
    }, [onUpdate, index])

    return (
        <div className={cx(classes.container, className)} ref={containerRef} {...rest}>
            <div className={classes.slider}>
                <div className={classes.sliderWrapper} style={style}>
                    {Children.map(children, (child, index) => (
                        <div key={index} className={classes.slide} style={{ width: containerRef.current?.offsetWidth }}>
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
