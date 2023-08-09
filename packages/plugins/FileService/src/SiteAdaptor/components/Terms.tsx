import { makeStyles } from '@masknet/theme'
import { Button, Link, Typography } from '@mui/material'
import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { Translate, useI18N } from '../../locales/index.js'
import { useTermsConfirmed } from '../storage.js'

const useStyles = makeStyles()((theme) => ({
    terms: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
    },
    content: {
        padding: theme.spacing(2),
        display: 'flex',
        flexGrow: 1,
        overflow: 'auto',
        flexDirection: 'column',
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    title: {
        fontSize: 16,
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '20px',
    },
    introduction: {
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(2),
        flexGrow: 1,
        marginBottom: 'auto',
    },
    footNote: {
        color: theme.palette.maskColor.second,
        fontSize: 16,
        marginTop: theme.spacing(2),
    },
    link: {
        color: theme.palette.primary.main,
    },
    actions: {
        padding: '16px',
        display: 'flex',
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
        justifyContent: 'space-between',
        gap: theme.spacing(2),
        '& > :not(:first-of-type)': {
            marginLeft: 0,
        },
    },
    cancelButton: {
        color: theme.palette.maskColor.main,
        backgroundColor: theme.palette.maskColor.thirdMain,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.thirdMain,
        },
    },
    confirmButton: {
        color: theme.palette.maskColor.bottom,
        backgroundColor: theme.palette.maskColor.main,
    },
    button: {
        flexGrow: 1,
        height: 40,
    },
}))

const TERMS_URL = 'https://legal.mask.io/arweave/file-service/plugin-terms.html'
const POLICY_URL = 'https://legal.mask.io/arweave/file-service/privacy-policy-uploader.html'

export function Terms() {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const [confirmed, setConfirmed] = useTermsConfirmed()

    useLayoutEffect(() => {
        if (confirmed) navigate(-1)
    }, [confirmed])

    return (
        <div className={classes.terms}>
            <div className={classes.content}>
                <Typography variant="h1" className={classes.title}>
                    {t.what_is_web3_file_service()}
                </Typography>
                <Typography variant="body2" className={classes.introduction}>
                    <Translate.introduction multiple components={{ br: <br /> }} />
                </Typography>
                <Typography variant="body2" className={classes.footNote}>
                    <Translate.foot_note
                        components={{
                            terms: <Link target="_blank" className={classes.link} href={TERMS_URL} />,
                            policy: <Link target="_blank" className={classes.link} href={POLICY_URL} />,
                        }}
                    />
                </Typography>
            </div>
            <div className={classes.actions}>
                <Button className={cx(classes.button, classes.cancelButton)} onClick={() => navigate(RoutePaths.Exit)}>
                    {t.cancel()}
                </Button>
                <Button className={cx(classes.button, classes.confirmButton)} onClick={() => setConfirmed(true)}>
                    {t.confirm()}
                </Button>
            </div>
        </div>
    )
}
