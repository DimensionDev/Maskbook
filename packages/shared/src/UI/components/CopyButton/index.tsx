import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Link, type LinkProps } from '@mui/material'
import { memo, useCallback, useRef, useState, type MouseEvent } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useSharedI18N } from '../../../index.js'

const useStyles = makeStyles()((theme) => ({
    copy: {
        '&:hover': {
            color: theme.palette.maskColor.main,
        },
    },
}))

export interface CopyButtonProps
    extends Omit<LinkProps<'button'>, 'color'>,
        Pick<GeneratedIconProps, 'size' | 'color'> {
    title?: string
    text: string
    /** defaults to 'Copied' */
    successText?: string
    /** stop event propagation and prevent default */
    scoped?: boolean
}

export const CopyButton = memo<CopyButtonProps>(function CopyButton({
    text,
    title,
    successText,
    size,
    color,
    scoped = true,
    ...props
}) {
    const t = useSharedI18N()
    const { classes, theme } = useStyles(undefined, { props })

    const [, copyToClipboard] = useCopyToClipboard()
    const [copied, setCopied] = useState(false)
    const [active, setActive] = useState(false)
    const timerRef = useRef<NodeJS.Timeout>()

    const handleCopy = useCallback(
        async (ev: MouseEvent<HTMLAnchorElement>) => {
            if (scoped) {
                ev.stopPropagation()
                ev.preventDefault()
            }
            copyToClipboard(text)
            setCopied(true)
            setActive(true)
            clearTimeout(timerRef.current)
            timerRef.current = setTimeout(setActive, 1500, false)
        },
        [text, scoped],
    )

    const tooltipTitle = copied ? successText ?? t.copied() : title ?? t.copy()
    const iconProps = { size, color }

    return (
        <ShadowRootTooltip open={active} title={tooltipTitle} placement="top" disableInteractive arrow>
            <Link
                underline="none"
                component="button"
                onClick={handleCopy}
                color="inherit"
                {...props}
                fontSize={0}
                className={classes.root}>
                {active ? (
                    <Icons.Check {...iconProps} color={theme.palette.maskColor.success} />
                ) : (
                    <Icons.Copy {...iconProps} className={classes.copy} />
                )}
            </Link>
        </ShadowRootTooltip>
    )
})
