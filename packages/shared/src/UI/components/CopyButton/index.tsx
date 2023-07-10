import { memo, useCallback, useState, type MouseEvent, useRef } from 'react'
import { Link } from '@mui/material'
import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { useSharedI18N } from '../../../index.js'
import { ShadowRootTooltip } from '@masknet/theme'

export interface CopyButtonProps extends Omit<GeneratedIconProps, 'title'> {
    title?: string
    text: string
    /** defaults to 'Copied' */
    successText?: string
}

export const CopyButton = memo<CopyButtonProps>(function CopyButton({ text, title, successText, ...props }) {
    const t = useSharedI18N()
    const [, copyToClipboard] = useCopyToClipboard()
    const [copied, setCopied] = useState(false)
    const [active, setActive] = useState(false)
    const timerRef = useRef<NodeJS.Timeout>()

    const handleCopy = useCallback(
        async (ev: MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            ev.preventDefault()

            copyToClipboard(text)
            setCopied(true)
            setActive(true)
            clearTimeout(timerRef.current)
            timerRef.current = setTimeout(setActive, 1500, false)
        },
        [text],
    )

    const reset = useCallback(() => {
        setCopied(false)
    }, [])

    const tooltipTitle = copied ? successText ?? t.copied() : title ?? t.copy()

    return (
        <ShadowRootTooltip title={tooltipTitle} placement="top" onOpen={reset}>
            <Link underline="none" component="button" onClick={handleCopy}>
                {active ? <Icons.Check {...props} /> : <Icons.Copy {...props} />}
            </Link>
        </ShadowRootTooltip>
    )
})
