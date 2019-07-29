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
                {/* // TODO: i18n */}
                <Tab icon={<FolderOpen />} aria-label="select backup file" />
                <Tab disabled={!('BarcodeDetector' in window)} icon={<Camera />} aria-label="scan QR code" />
                <Tab icon={<Text />} aria-label="paste the JSON by yourself" />
            </Tabs>
            <main className={classes.main}>
                {tab === 0 ? FileUI() : ''}
                {tab === 1 ? QR() : ''}
                {tab === 2 ? TextArea() : ''}

                {tab === 0 || tab === 2 ? (
                    <Button
                        onClick={() => {
                            tab === 0 && restore(fileRef.current!)
                            tab === 2 && restore(textAreaRef.current!.value)
                        }}
                        disabled={!fileRef.current}
                        variant="contained"
                        color="primary"
                        className={classes.button}>
                        {geti18nString('restore')}
                    </Button>
                ) : (
                    ''
                )}
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
    function QR() {
        return (
            <>
                {/* // TODO i18n */}
                <Typography variant="h5">Scan the QR Code</Typography>
                <Typography variant="body1">
                    You can find QR Code by <br />
                    1. right-click the icon of the Maskbook in the browser address bar <br />
                    2. click "Options" <br />
                    3. click "Setup for Mobile"
                </Typography>
                <QRScanner
                    onError={() => setError(true)}
                    scanning
                    className={classes.video}
                    width="100%"
                    onResult={restore}
                />
                <div className={qrError ? classes.videoError : ''}>
                    There is an error occur during the scanning.
                    <br />
                    You may try other ways to restore your account.
                </div>
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
