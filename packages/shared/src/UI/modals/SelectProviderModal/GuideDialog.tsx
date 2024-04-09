import { memo } from 'react'
import { useSharedTrans } from '../../../locales/i18n_generated.js'
import { InjectedDialog, type InjectedDialogProps } from '../../contexts/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { DialogContent, Link, Stack, Switch, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'

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
    const t = useSharedTrans()
    const { classes, cx } = useStyles()
    const name = provider.name

    return (
        <InjectedDialog {...rest} title={t.how_to_use_wallet({ name: provider.name })}>
            <DialogContent className={classes.content}>
                <section className={classes.section}>
                    <Typography fontSize={16} fontWeight={700}>
                        {t.if_not_installed({ name })}
                    </Typography>
                    <Typography mt={3} fontSize={14}>
                        {t.download_here({ name })}
                    </Typography>
                    <Link
                        href={provider.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx(classes.card, classes.downloadButton)}>
                        <img width={30} height={30} src={provider.icon} />
                        <Typography fontSize={16} fontWeight={700} ml={1.5}>
                            {t.check_out_website()}
                        </Typography>
                    </Link>
                </section>
                <section className={classes.section}>
                    <Typography fontSize={16} fontWeight={700}>
                        {t.if_installed({ name })}
                    </Typography>
                    <Typography mt={1.5} fontSize={14}>
                        {t.enable_wallet_and_disable_others({ name })}
                    </Typography>
                    <Stack className={classes.card} style={{ cursor: 'default' }}>
                        <Stack flexDirection="row" alignItems="center">
                            <img width={30} height={30} src={provider.icon} />
                            <Typography ml={1.5} fontSize={16}>
                                {name}
                            </Typography>
                        </Stack>
                        <Stack flexDirection="row" mt={3}>
                            <div className={classes.button}>{t.details()}</div>
                            <div className={classes.button}>{t.remove()}</div>
                            <Switch checked style={{ cursor: 'default' }} />
                        </Stack>
                    </Stack>
                </section>
            </DialogContent>
        </InjectedDialog>
    )
})
