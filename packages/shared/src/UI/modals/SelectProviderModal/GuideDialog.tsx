import { memo } from 'react'
import { InjectedDialog, type InjectedDialogProps } from '../../contexts/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { DialogContent, Link, Stack, Switch, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2),
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    section: {
        border: `solid 1px ${theme.palette.maskColor.line}`,
        borderRadius: 8,
        padding: theme.spacing(3),
        marginBottom: theme.spacing(2),
    },
    card: {
        border: `solid 1px ${theme.palette.maskColor.line}`,
        borderRadius: 8,
        marginTop: theme.spacing(3),
        display: 'inline-block',
        padding: theme.spacing(1.5),
    },
    downloadButton: {
        marginTop: theme.spacing(3),
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        '&:hover': {
            textDecoration: 'none',
        },
    },
    button: {
        padding: theme.spacing(1.5),
        display: 'inline-block',
        border: `solid 1px ${theme.palette.maskColor.line}`,
        marginRight: theme.spacing(3),
    },
}))

interface Props extends InjectedDialogProps {
    provider: Web3Helper.ProviderDescriptorAll
}

export const GuideDialog = memo(function GuideDialog({ provider, ...rest }: Props) {
    const { classes, cx } = useStyles()
    const name = provider.name

    return (
        <InjectedDialog {...rest} title={<Trans>How to use {provider.name} Wallet?</Trans>}>
            <DialogContent className={classes.content}>
                <section className={classes.section}>
                    <Typography fontSize={16} fontWeight={700}>
                        <Trans>1. If you haven't installed the {name} Wallet</Trans>
                    </Typography>
                    <Typography mt={3} fontSize={14}>
                        <Trans>Download the {name} Wallet here</Trans>
                    </Typography>
                    <Link
                        href={provider.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx(classes.card, classes.downloadButton)}>
                        <img width={30} height={30} src={provider.icon} />
                        <Typography fontSize={16} fontWeight={700} ml={1.5}>
                            <Trans>Check out the official website</Trans>
                        </Typography>
                    </Link>
                </section>
                <section className={classes.section}>
                    <Typography fontSize={16} fontWeight={700}>
                        <Trans>2. If you have installed the {name} Wallet</Trans>
                    </Typography>
                    <Typography mt={1.5} fontSize={14}>
                        <Trans>Enable the {name} Wallet extension and disable other wallet extensions</Trans>
                    </Typography>
                    <Stack className={classes.card} style={{ cursor: 'default' }}>
                        <Stack flexDirection="row" alignItems="center">
                            <img width={30} height={30} src={provider.icon} />
                            <Typography ml={1.5} fontSize={16}>
                                {name}
                            </Typography>
                        </Stack>
                        <Stack flexDirection="row" mt={3}>
                            <div className={classes.button}>
                                <Trans>Details</Trans>
                            </div>
                            <div className={classes.button}>
                                <Trans>Remove</Trans>
                            </div>
                            <Switch checked style={{ cursor: 'default' }} />
                        </Stack>
                    </Stack>
                </section>
            </DialogContent>
        </InjectedDialog>
    )
})
