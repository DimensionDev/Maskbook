import { makeStyles } from '@masknet/theme'
import { Button, Link, Typography } from '@mui/material'
import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { useTermsConfirmed } from '../storage.js'
import { Trans } from '@lingui/macro'

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
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
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
                    <Trans>What is Web3 File Service?</Trans>
                </Typography>
                <Typography variant="body2" className={classes.introduction}>
                    <Trans>
                        Web3 File Service is a decentralized storage service provided by Mask Network. It allows users
                        to store files in different decentralized network. This feature is powered by Mask Network’s
                        partner file storage protocols such as IPFS, Arweave and Meson Network.It supports files in PDF,
                        DOC, JPG, PNG, MP3, MP4. and other formats. At present, the maximum file upload size is 10 MB.{' '}
                        <br />
                        <br />
                        You can store files in multiple decentralized networks through the Web3 file service function.
                        When uploading files, you can choose to encrypt or decrypt them. According to the selected
                        upload encrypted method, you can obtain two file links with encryption and non encryption. Users
                        of Mask Network can share files to social platforms through this link. By using encrypted files,
                        you can ensure the security of your files and prevent privacy leakage. <br />
                        <br />
                        It should be noted that any user who has the link can download and share the file. With the
                        characteristics of decentralized file storage systems, your uploaded files can never be deleted
                        or tampered. Please upload files containing personal privacy with caution. <br />
                        <br />
                        The Web3 File Service provided by Mask Network enables individuals to be free from data
                        restrictions imposed by traditional social platforms, enabling free encrypted transmission and
                        sharing of files. At present, the service is provisionally free for all users with Mask Network
                        absorbing all the costs. Mask Network will provide updates on future costs users may have to
                        bear.
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
