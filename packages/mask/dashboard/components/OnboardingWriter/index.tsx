import { useState, useMemo, useEffect, type JSX } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    typed: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
        '& > strong': {
            color: theme.vars.palette.maskColor.highlight,
        },
    },
    typing: {
        opacity: 0.5,
    },
}))

interface OnboardingWriterProps extends withClasses<'typed' | 'endTyping'> {
    sentence: Array<string | undefined>
    onFinish?: () => void
}
export function OnboardingWriter({ sentence, onFinish, ...props }: OnboardingWriterProps) {
    const { classes, cx } = useStyles(undefined, { props })
    const typing = cx(classes.typing, classes.typed)
    const [jsx, setJsx] = useState<JSX.Element | undefined>(undefined)

    const writer = useMemo(() => onBoardingWriter({ typed: classes.typed, typing }, sentence), [sentence])
    useEffect(() => {
        const timer = setInterval(() => {
            const next = writer.next()
            if (next.done) {
                clearInterval(timer)
                onFinish?.()
            } else {
                setJsx(next.value)
            }
        }, 50)

        return () => {
            clearInterval(timer)
        }
    }, [writer, onFinish])

    return jsx
}
let segmenter: Intl.Segmenter
function* onBoardingWriter(className: { typed: string; typing: string }, sentences: Array<string | undefined>) {
    segmenter ||= new Intl.Segmenter()
    const previousLines: JSX.Element[] = []
    const currentLine: Array<{ type: 'bold' | 'normal'; text: string }> = [{ type: 'normal', text: '' }]

    for (const sentence of sentences) {
        if (!sentence) continue
        const chars = [...segmenter.segment(sentence)]
        let currentLineJSX: JSX.Element | undefined
        for (let index = 0; index < chars.length; index += 1) {
            const char = chars[index].segment
            const lastPiece = currentLine.at(-1)!
            if (char === '*') {
                const nextChar = chars[index + 1]?.segment
                if (nextChar === '*') {
                    currentLine.push({ type: lastPiece.type === 'normal' ? 'bold' : 'normal', text: '' })
                    index += 1
                    continue
                }
            }
            lastPiece.text += char
            const children = currentLine.map((x, index) =>
                x.type === 'normal' ? x.text : <strong key={index}>{x.text}</strong>,
            )
            currentLineJSX = (
                <Typography className={className.typed} key={sentence}>
                    {children}
                </Typography>
            )
            yield (
                <>
                    {previousLines}
                    {
                        <Typography className={className.typing} key={sentence}>
                            {children}
                        </Typography>
                    }
                </>
            )
        }
        if (currentLineJSX) {
            previousLines.push(currentLineJSX)
            currentLine.length = 0
            currentLine.push({ type: 'normal', text: '' })
        }
        yield <>{previousLines}</>
    }
}
