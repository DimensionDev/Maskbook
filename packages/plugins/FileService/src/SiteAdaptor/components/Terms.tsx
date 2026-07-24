import { makeStyles } from '@masknet/theme'
import { Button, Link, Typography } from '@mui/material'
import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { useTermsConfirmed } from '../storage.js'
import { Trans } from '@lingui/react/macro'

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
        color: theme.vars.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '20px',
    },
    introduction: {
        lineHeight: '18px',
        color: theme.vars.palette.maskColor.second,
        marginTop: theme.spacing(2),
        flexGrow: 1,
        marginBottom: 'auto',
    },
    footNote: {
        color: theme.vars.palette.maskColor.second,
        fontSize: 16,
        marginTop: theme.spacing(2),
    },
    link: {
        color: theme.vars.palette.primary.main,
    },
    actions: {
        padding: '16px',
        display: 'flex',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        ...theme.applyStyles('dark', {
            boxShadow: '0px 0px 20px rgba(255, 255, 255, 0.12)',
        }),
        justifyContent: 'space-between',
        gap: theme.spacing(2),
        '& > :not(:first-of-type)': {
            marginLeft: 0,
        },
    },
    cancelButton: {
        color: theme.vars.palette.maskColor.main,
        backgroundColor: theme.vars.palette.maskColor.thirdMain,
        '&:hover': {
            backgroundColor: theme.vars.palette.maskColor.thirdMain,
        },
    },
    confirmButton: {
        color: theme.vars.palette.maskColor.bottom,
        backgroundColor: theme.vars.palette.maskColor.main,
    },
    button: {
        flexGrow: 1,
        height: 40,
    },
}))

const TERMS_URL = 'https://legal.mask.io/arweave/file-service/plugin-terms.html'
const POLICY_URL = 'https://legal.mask.io/arweave/file-service/privacy-policy-uploader.html'

export function Terms() {
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const [confirmed, setConfirmed] = useTermsConfirmed()

    useLayoutEffect(() => {
        if (!confirmed) return
        navigate(-1)
    }, [confirmed])

    return (
        <div className={classes.terms}>
            <div className={classes.content}>
                <Typography variant="h1" className={classes.title}>
                    <Trans>What is Web3 File Service?</Trans>
                </Typography>
                <Typography variant="body2" className={classes.introduction}>
                    <Trans>
                        Web3 File Service is a decentralized storage solution provided by Mask Network that allows users
                        to store files across multiple decentralized networks. This service is powered by Mask Network’s
                        partner protocols, including IPFS and Arweave. It supports various file formats such as PDF,
                        DOC, JPG, PNG, MP3, MP4, and more, with a maximum file size of 10MB per upload.
                        <br />
                        Through the Web3 File Service, users can upload files to different decentralized networks and
                        choose whether or not to encrypt them, thereby generating files with different levels of
                        confidentiality. Mask Network users can share these files to social platforms via generated
                        links. Using encryption helps protect file security and prevent privacy breaches.
                        <br />
                        Please note that anyone with the link can access and share the file. Due to the immutable nature
                        of decentralized storage systems, uploaded files cannot be deleted or modified, so please
                        exercise caution when uploading files containing personal information.
                        <br />
                        Mask Network’s Web3 File Service is designed to help users break free from the data limitations
                        of traditional social platforms, enabling secure and decentralized file sharing. The service is
                        currently free for all Mask Network users. Any future costs will be announced in advance.
                    </Trans>
                </Typography>
                <Typography variant="body2" className={classes.footNote}>
                    <Trans>
                        By using this plugin, you agree to the{' '}
                        <Link target="_blank" rel="noreferrer noopener" className={classes.link} href={TERMS_URL}>
                            terms
                        </Link>{' '}
                        and the{' '}
                        <Link target="_blank" rel="noreferrer noopener" className={classes.link} href={POLICY_URL}>
                            privacy policy
                        </Link>
                        .
                    </Trans>
                </Typography>
            </div>
            <div className={classes.actions}>
                <Button className={cx(classes.button, classes.cancelButton)} onClick={() => navigate(RoutePaths.Exit)}>
                    <Trans>Cancel</Trans>
                </Button>
                <Button className={cx(classes.button, classes.confirmButton)} onClick={() => setConfirmed(true)}>
                    <Trans>Confirm</Trans>
                </Button>
            </div>
        </div>
    )
}
