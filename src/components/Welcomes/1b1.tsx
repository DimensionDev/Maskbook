import * as React from 'react'

import ArrowBack from '@material-ui/icons/ArrowBack'
import { useDragAndDrop } from '../../utils/hooks/useDragAndDrop'
import { geti18nString } from '../../utils/i18n'
import { makeStyles, Button, Typography, Tabs, Tab } from '@material-ui/core'
import { styled } from '@material-ui/styles'
import FolderOpen from '@material-ui/icons/FolderOpen'
import Camera from '@material-ui/icons/CameraAlt'
import Text from '@material-ui/icons/TextFormat'
import WelcomeContainer from './WelcomeContainer'
import QRScanner from './QRScanner'
import { isWKWebkit, iOSHost } from '../../utils/iOS-RPC'
import { useAsync } from '../../utils/components/AsyncComponent'

const RestoreBox = styled('div')(({ theme }) => ({
    color: theme.palette.text.hint,
    border: `2px dashed ${theme.palette.divider}`,
    whiteSpace: 'pre-line',
    minHeight: 160 - theme.spacing(8),
    maxWidth: 300,
    borderRadius: theme.shape.borderRadius,
    display: 'inline-flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    padding: theme.spacing(4),
    transition: '0.4s',
}))
interface Props {
    back(): void
    restore(file: File | string): void
}
const videoHeight = 360
const useStyles = makeStyles(theme => ({
    nav: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(1),
    },
    navButton: {
        color: theme.palette.text.hint,
    },
    navButtonIcon: {
        marginRight: theme.spacing(1),
    },
    main: {
        padding: '2rem 2rem 1rem 2rem',
        textAlign: 'center',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
    },
    button: {
        minWidth: 180,
    },
    file: {
        display: 'none',
    },
    restoreBox: {
        width: '100%',
        color: 'gray',
        transition: '0.4s',
        '&[data-active=true]': {
            color: 'black',
        },
    },
    video: {
        background: 'black',
        height: videoHeight,
    },
    videoError: {
        background: 'rgba(0, 0, 0, 0.7)',
        height: videoHeight,
        transform: `translate(0px, -${videoHeight + 28}px)`,
        color: 'white',
        paddingTop: videoHeight / 2,
        boxSizing: 'border-box',
        marginBottom: -videoHeight,
        paddingLeft: '2em',
        paddingRight: '2em',
    },
    textarea: {
        width: '100%',
        height: 200,
    },
}))
export default function Welcome({ back, restore }: Props) {
    const classes = useStyles()
    const ref = React.useRef<HTMLInputElement>(null)
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null)
    const { dragEvents, fileReceiver, fileRef, dragStatus } = useDragAndDrop()

    const [tab, setTab] = React.useState(0)
    const [qrError, setError] = React.useState<boolean>(false)

    return (
        <WelcomeContainer {...dragEvents}>
            <nav className={classes.nav}>
                <Button onClick={back} disableFocusRipple disableRipple className={classes.navButton}>
                    <ArrowBack className={classes.navButtonIcon} />
                    {geti18nString('back')}
                </Button>
            </nav>
            <Tabs
                value={tab}
                onChange={(e, i) => setTab(i)}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                aria-label="icon tabs example">
                <Tab icon={<FolderOpen />} aria-label={geti18nString('welcome_1b_tabs_backup')} />
                <Tab
                    disabled={!('BarcodeDetector' in window || isWKWebkit)}
                    icon={<Camera />}
                    aria-label={geti18nString('welcome_1b_tabs_qr')}
                />
                <Tab icon={<Text />} aria-label={geti18nString('welcome_1b_tabs_text')} />
            </Tabs>
            <main className={classes.main}>
                {tab === 0 ? FileUI() : null}
                {tab === 1 ? isWKWebkit ? <WKWebkitQR onScan={restore} onQuit={() => setTab(0)} /> : QR() : null}
                {tab === 2 ? TextArea() : null}

                {tab === 0 ? (
                    <Button
                        onClick={() => restore(fileRef.current!)}
                        disabled={!fileRef.current}
                        variant="contained"
                        color="primary"
                        className={classes.button}>
                        {geti18nString('restore')}
                    </Button>
                ) : null}
                {tab === 2 ? (
                    <Button
                        onClick={() => restore(textAreaRef.current!.value)}
                        variant="contained"
                        color="primary"
                        className={classes.button}>
                        {geti18nString('restore')}
                    </Button>
                ) : null}
            </main>
        </WelcomeContainer>
    )

    function FileUI() {
        return (
            <>
                <Typography variant="h5">{geti18nString('welcome_1b_title')}</Typography>
                <form>
                    <input
                        className={classes.file}
                        type="file"
                        accept="application/json"
                        ref={ref}
                        onChange={fileReceiver}
                    />
                    <RestoreBox
                        className={classes.restoreBox}
                        data-active={dragStatus === 'drag-enter'}
                        onClick={() => ref.current && ref.current.click()}>
                        {dragStatus === 'drag-enter'
                            ? geti18nString('welcome_1b_dragging')
                            : fileRef.current
                            ? geti18nString('welcome_1b_file_selected', fileRef.current.name)
                            : geti18nString('welcome_1b_no_file_selected')}
                    </RestoreBox>
                </form>
            </>
        )
    }
    function WKWebkitQR(props: { onScan(val: string): void; onQuit(): void }) {
        useAsync(() => iOSHost.scanQRCode(), []).then(props.onScan, props.onQuit)
        return null
    }
    function QR() {
        return (
            <>
                <Typography variant="h5">{geti18nString('welcome_1b_tabs_qr')}</Typography>
                <Typography variant="body1">
                    {geti18nString('welcome_1b_qr_0')} <br />
                    {geti18nString('welcome_1b_qr_1')} <br />
                    {geti18nString('welcome_1b_qr_2')} <br />
                    {geti18nString('welcome_1b_qr_3')}
                </Typography>
                <QRScanner
                    onError={() => setError(true)}
                    scanning
                    className={classes.video}
                    width="100%"
                    onResult={restore}
                />
                {qrError ? (
                    <div className={classes.videoError}>
                        {geti18nString('welcome_1b_qr_error_1')}
                        There is an error occur during the scanning.
                        <br />
                        {geti18nString('welcome_1b_qr_error_2')}
                        You may try other ways to restore your account.
                    </div>
                ) : null}
            </>
        )
    }
    function TextArea() {
        return (
            <>
                <Typography variant="h5">Paste the JSON here</Typography>
                <textarea className={classes.textarea} ref={textAreaRef} />
            </>
        )
    }
}
