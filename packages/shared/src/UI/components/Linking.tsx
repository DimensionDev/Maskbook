import { Link, LinkProps, Typography, TypographyProps } from '@mui/material'
import { ForwardedRef, forwardRef } from 'react'

export interface LinkingProps {
    href?: string
    children?: React.ReactNode
    LinkProps?: Partial<LinkProps>
    TypographyProps?: Partial<TypographyProps>
}

export const Linking = forwardRef<HTMLAnchorElement | HTMLSpanElement, LinkingProps>(function Linking(props, ref) {
    const { href, LinkProps, TypographyProps, children } = props
    try {
        const { hostname } = new URL(href ?? '')
        return (
            <Link
                color={(theme) => theme.palette.maskColor.main}
                target="_blank"
                rel="noopener noreferrer"
                href={props.href}
                {...LinkProps}
                ref={ref as ForwardedRef<HTMLAnchorElement>}>
                {children ? (
                    children
                ) : (
                    <Typography variant="body2" component="span" {...TypographyProps}>
                        {hostname.replace(/^www./i, '')}
                    </Typography>
                )}
            </Link>
        )
    } catch {
        return (
            <span className={LinkProps?.className} title={LinkProps?.title} ref={ref as ForwardedRef<HTMLSpanElement>}>
                {children ? (
                    children
                ) : (
                    <Typography variant="body2" component="span" {...TypographyProps}>
                        {href}
                    </Typography>
                )}
            </span>
        )
    }
})
