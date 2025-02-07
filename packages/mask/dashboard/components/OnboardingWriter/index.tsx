import { sum } from 'lodash-es'
import { useState, useMemo, useEffect } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => ({
    typed: {
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 700,
        '& > strong': {
            color: theme.palette.maskColor.highlight,
        },
    },
    endTyping: {
        opacity: 0.5,
    },
}))

interface OnboardingWriterProps extends withClasses<'typed' | 'endTyping'> {
    sentence: Array<string[] | undefined>
}
let segmenter: Intl.Segmenter
export function OnboardingWriter({ sentence, ...props }: OnboardingWriterProps) {
    const { classes, cx } = useStyles(undefined, { props })

    const allChars = useMemo(() => sentence.flat().filter(Boolean).join(''), [sentence])
    const allCharsSegmented = useMemo(() => {
        return [...(segmenter ||= new Intl.Segmenter()).segment(allChars)].map((x) => x.segment)
    }, [allChars])
    const segmentCount = allCharsSegmented.length

    const [codePointIndex, setCodePointIndex] = useState(0)
    const [segmentIndex, setSegmentIndex] = useState(0)
    useRenderPhraseCallbackOnDepsChange(() => {
        setCodePointIndex(0)
        setSegmentIndex(0)
    }, [sentence])
    useEffect(() => {
        const timer = setInterval(() => {
            setSegmentIndex((segmentIndex) => {
                const nextSegmentIndex = segmentIndex + 1
                if (segmentIndex > segmentCount) {
                    clearInterval(timer)
                    return segmentIndex
                }
                setCodePointIndex(allCharsSegmented.slice(0, nextSegmentIndex).join('').length)
                return nextSegmentIndex
            })
        }, 50)

        return () => {
            clearInterval(timer)
        }
    }, [allCharsSegmented, segmentCount])

    const jsx = useMemo(() => {
        const newJsx = []
        let remain = codePointIndex
        for (const fragment of sentence) {
            if (!fragment) continue
            if (remain <= 0) break
            const size = sum(fragment.map((x) => x.length))
            const take = Math.min(size, remain)

            remain -= take

            const [text, strongText] = fragment

            const className = cx(classes.typed, remain !== 0 ? classes.endTyping : undefined)
            // the trailing space gets trimmed by i18n marco
            if (take <= text.length) newJsx.push(<Typography className={className}>{text.slice(0, take)}</Typography>)
            else
                newJsx.push(
                    <Typography className={className}>
                        {text}
                        <strong key={size}> {strongText.slice(0, take - text.length)}</strong>
                    </Typography>,
                )
        }

        return newJsx
    }, [sentence, codePointIndex])

    return <>{jsx}</>
}
