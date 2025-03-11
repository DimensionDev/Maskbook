import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { memo, useState, type HTMLProps } from 'react'
import { SecurityProvider } from '../../constants.js'

const useStyles = makeStyles()((theme) => ({
    card: {
        width: 400,
        boxSizing: 'border-box',
        padding: theme.spacing(2),
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        backgroundColor: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 4px 30px 0px rgba(0, 0, 0, 0.1)'
            :   '0px 4px 30px 0px rgba(255, 255, 255, 0.15)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    icon: {
        filter: 'drop-shadow(0px 6px 12px rgba(254, 218, 3, 0.20))',
        backdropFilter: 'blur(8px)',
    },
    name: {
        display: 'flex',
        fontFamily: 'Helvetica',
        fontWeight: 700,
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    provider: {
        fontFamily: 'Helvetica',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    providerName: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    target: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.danger,
        minWidth: 0,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    link: {
        textDecoration: 'underline',
    },
    reportButton: {
        padding: theme.spacing(1, 0),
        width: 60,
        minWidth: 60,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        color: theme.palette.maskColor.main,
        backgroundColor: theme.palette.maskColor.thirdMain,
        marginLeft: 'auto',
    },
    description: {
        fontFamily: 'Helvetica',
        borderRadius: 8,
        padding: theme.spacing(1),
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
        backgroundColor: theme.palette.maskColor.danger,
        color: theme.palette.maskColor.white,
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    link?: string
    address?: string
    securityProvider: SecurityProvider
}

export const WarningCard = memo(function WarningCard({ link, address, securityProvider, ...rest }: Props) {
    const { classes, cx } = useStyles()
    const [isReporting] = useState(false)
    return (
        <div {...rest} className={cx(classes.card, rest.className)}>
            <div className={classes.header}>
                <div className={classes.name}>
                    <Icons.Danger className={classes.icon} size={24} />
                    <Typography className={classes.name}>{t`Scam Warning`}</Typography>
                </div>
                {securityProvider === SecurityProvider.GoPlus ?
                    <div className={classes.provider}>
                        <Typography>
                            <Trans>
                                Powered by <span className={classes.providerName}>Go+</span>
                            </Trans>
                        </Typography>
                        <Icons.GoPlus size={24} />
                    </div>
                :   <div className={classes.provider}>
                        <Typography>
                            <Trans>
                                Powered by <span className={classes.providerName}>Scamsniffer</span>
                            </Trans>
                        </Typography>
                        <Icons.ScamSniffer size={24} />
                    </div>
                }
            </div>
            <div className={classes.content}>
                {link ?
                    <a className={cx(classes.link, classes.target)} href={link} title={link}>
                        {link}
                    </a>
                :   <Typography className={classes.target} title={address}>
                        {address}
                    </Typography>
                }
                <Button variant="text" className={classes.reportButton}>
                    {isReporting ?
                        <LoadingBase size={16} />
                    :   <Icons.Flag size={16} />}
                </Button>
            </div>
            <Typography className={classes.description}>
                <Trans>
                    This domain or address is currently on the Mask Network warning list which may include malicious
                    entries, phishing or scams.
                </Trans>
            </Typography>
        </div>
    )
})
