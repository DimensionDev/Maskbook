import { Link, type LinkProps, Typography, type TypographyProps } from '@mui/material'

export interface LinkingProps {
    href?: string
    children?: React.ReactNode
    LinkProps?: Partial<LinkProps>
    TypographyProps?: Partial<TypographyProps>
}

export function Linking(props: LinkingProps) {
    const { href, LinkProps, TypographyProps, children } = props
    if (href && URL.canParse(href)) {
        const { hostname } = new URL(href)
        return (
            <Link
                color={(theme) => theme.palette.maskColor.main}
                target="_blank"
                rel="noopener noreferrer"
                href={props.href}
                {...LinkProps}>
                {children ?
                    children
                :   <Typography variant="body2" component="span" {...TypographyProps}>
                        {hostname.replace(/^www./i, '')}
                    </Typography>
                }
            </Link>
        )
    } else {
        return (
            <span className={LinkProps?.className} title={LinkProps?.title}>
                {children ?
                    children
                :   <Typography variant="body2" component="span" {...TypographyProps}>
                        {href}
                    </Typography>
                }
            </span>
        )
    }
}
