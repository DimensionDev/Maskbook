import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Link, type LinkProps } from '@mui/material'
import {
    memo,
    useCallback,
    useRef,
    useState,
    type MouseEvent,
    useImperativeHandle,
    type RefAttributes,
    type ReactNode,
} from 'react'
import { useCopyToClipboard } from 'react-use'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    copy: {
        '&:hover': {
            color: theme.palette.maskColor.main,
        },
    },
}))

export interface CopyButtonProps
    extends Omit<LinkProps<'button'>, 'color' | 'ref'>,
        Pick<GeneratedIconProps, 'size' | 'color'>,
        RefAttributes<CopyButtonRef> {
    title?: string
    text: string
    /** defaults to 'Copied' */
    successText?: ReactNode
    /** stop event propagation and prevent default */
    scoped?: boolean
}

export interface CopyButtonRef {
    handleCopy: (ev: MouseEvent) => void
}

export const CopyButton = memo(function CopyButton({
    text,
    title,
    successText,
    size,
    color,
    scoped = true,
    className,
    ref,
    ...props
}: CopyButtonProps) {
    const { classes, cx, theme } = useStyles(undefined, { props })

    const [, copyToClipboard] = useCopyToClipboard()
    const [copied, setCopied] = useState(false)
    const [active, setActive] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    const handleCopy = useCallback(
        async (ev: MouseEvent) => {
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

    const tooltipTitle = copied ? successText ?? <Trans>Copied!</Trans> : title ?? <Trans>Copy</Trans>
    const iconProps = { size, color }

    useImperativeHandle(
        ref,
        () => ({
            handleCopy,
        }),
        [handleCopy],
    )

    return (
        <ShadowRootTooltip open={active} title={tooltipTitle} placement="top" disableInteractive arrow>
            <Link
                underline="none"
                component="button"
                onClick={handleCopy}
                color="inherit"
                {...props}
                fontSize={0}
                className={cx(classes.root, className)}>
                {active ?
                    <Icons.Check {...iconProps} color={theme.palette.maskColor.success} />
                :   <Icons.Copy {...iconProps} className={classes.copy} />}
            </Link>
        </ShadowRootTooltip>
    )
})
