import React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import { Link } from 'react-router-dom'
import { Breadcrumbs, Theme, Typography, Link as MuiLink } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        footerButtons: {
            marginTop: theme.spacing(3),
            '& ol': {
                justifyContent: 'center',
            },
        },
        footerButton: {
            borderRadius: '0',
            whiteSpace: 'nowrap',
            '& > span': {
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
            },
        },
    }),
)

const FooterLink = function(props: any) {
    const classes = useStyles()
    return (
        <MuiLink
            underline="none"
            {...(props.href
                ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
                : { to: props.to, component: Link })}
            color="inherit"
            className={classes.footerButton}>
            <Typography variant="body2">{props.children}</Typography>
        </MuiLink>
    )
}

export default function FooterLine() {
    const classes = useStyles()
    return (
        <Breadcrumbs className={classes.footerButtons} separator="|" aria-label="breadcrumb">
            <FooterLink href="https://maskbook.com/">Maskbook.com</FooterLink>
            <FooterLink href="https://github.com/DimensionDev/Maskbook/releases">
                {geti18nString('version')} {globalThis?.browser.runtime.getManifest().version}
            </FooterLink>
            <FooterLink href="https://maskbook.com/download-links/#mobile">
                {geti18nString('dashboard_mobile_test')}
            </FooterLink>
            <FooterLink href="https://github.com/DimensionDev/Maskbook">
                {geti18nString('dashboard_source_code')}
            </FooterLink>
            <FooterLink href="https://maskbook.com/privacy-policy/">{geti18nString('privacy_policy')}</FooterLink>
        </Breadcrumbs>
    )
}
