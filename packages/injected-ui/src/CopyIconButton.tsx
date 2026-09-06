import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Link, type LinkProps } from '@mui/material'
import { memo, useCallback, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useCopyToClipboard } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    copy: {
        '&:hover': {
            color: theme.vars.palette.maskColor.main,
        },
    },
}))

export interface CopyIconButtonProps
    extends Omit<LinkProps<'button'>, 'color' | 'title'>,
        Pick<GeneratedIconProps, 'size' | 'color'> {
    text: string
    /** Tooltip shown before copying. Defaults to 'Copy'. */
    title?: ReactNode
    /** Tooltip shown right after copying. Defaults to 'Copied!'. */
    successText?: ReactNode
    /** stop event propagation and prevent default */
    scoped?: boolean
}

/**
 * A copy-to-clipboard icon button, forked from @masknet/shared's CopyButton without the Trans
 * default tooltips (title/successText are always caller-supplied here) so it can be imported by
 * apps/book without pulling in @masknet/shared's barrel. See
 * packages/injected-ui/src/PersonaPublicKey.tsx for a usage.
 */
export const CopyIconButton = memo(function CopyIconButton({
    text,
    title = 'Copy',
    successText = 'Copied!',
    size,
    color,
    scoped = true,
    className,
    ...props
}: CopyIconButtonProps) {
    const { classes, cx, theme } = useStyles(undefined, { props })

    const [, copyToClipboard] = useCopyToClipboard()
    const [copied, setCopied] = useState(false)
    const [active, setActive] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    const handleCopy = useCallback(
        (ev: MouseEvent) => {
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

    const tooltipTitle = copied ? successText : title
    const iconProps = { size, color }

    return (
        <ShadowRootTooltip open={active} title={tooltipTitle} placement="top" disableInteractive arrow>
            <Link
                underline="none"
                component="button"
                onClick={handleCopy}
                color="inherit"
                {...props}
                className={cx(classes.root, className)}
                sx={[{ fontSize: 0 }, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}>
                {active ?
                    <Icons.Check {...iconProps} color={theme.vars.palette.maskColor.success} />
                :   <Icons.Copy {...iconProps} className={classes.copy} />}
            </Link>
        </ShadowRootTooltip>
    )
})
