import { useState } from 'react'
import { useInterval } from 'react-use'
import { Fade } from '@mui/material'

export interface CarouselProps {
    items: React.ReactElement[]
    delay?: number
}

export function Carousel({ items, delay = 1e4 }: CarouselProps) {
    const [current, setCurrent] = useState(0)
    useInterval(() => setCurrent((c) => c + 1), delay)
    return (
        <>
            {items.map((item, i) => (
                <Fade in={current % items.length === i} key={i}>
                    {item}
                </Fade>
            ))}
        </>
    )
}
