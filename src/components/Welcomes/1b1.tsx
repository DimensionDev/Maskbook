import * as React from 'react'

import { useDragAndDrop } from '../../utils/hooks/useDragAndDrop'
import { geti18nString } from '../../utils/i18n'
import {
    makeStyles,
    Button,
    Typography,
    Tabs,
    Tab,
    Theme,
    Card,
    CardContent,
    CardActions,
    CardHeader,
    DialogActions,
} from '@material-ui/core'
import { styled } from '@material-ui/styles'
import FolderOpen from '@material-ui/icons/FolderOpen'
import Camera from '@material-ui/icons/CameraAlt'
import Text from '@material-ui/icons/TextFormat'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import PersonIcon from '@material-ui/icons/Person'
import CheckIcon from '@material-ui/icons/Check'
import LanguageIcon from '@material-ui/icons/Language'
import WelcomeContainer from './WelcomeContainer'
import Navigation from './Navigation/Navigation'
import QRScanner from './QRScanner'
import { isWKWebkit, iOSHost } from '../../utils/iOS-RPC'
import { useAsync } from '../../utils/components/AsyncComponent'
import {
    BackupJSONFileVersion1,
    UpgradeBackupJSONFile,
    BackupJSONFileLatest,
} from '../../utils/type-transform/BackupFile'

const RestoreBox = styled('div')(({ theme }: { theme: Theme }) => ({
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
    // ? We cannot send out File | string. Because Firefox will reject the permission request
    // ? because read the file is a async procedure.
    restore(json: BackupJSONFileLatest): void
}
const videoHeight = 360
const useStyles = makeStyles((theme: Theme) => ({
    main: {
        padding: '2rem 2rem 1rem 2rem',
        textAlign: 'center',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
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
export default function Welcome({ back, restore: originalRestore }: Props) {
    const classes = useStyles()
    const ref = React.useRef<HTMLInputElement>(null)
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null)
    const restore = (str: string) => {
        const json = JSON.parse(str)
        const upgraded = UpgradeBackupJSONFile(json)
        setJson(upgraded)
    }
    const { dragEvents, fileReceiver, fileRef, dragStatus } = useDragAndDrop(file => {
        const fr = new FileReader()
        fr.readAsText(file)
        fr.addEventListener('loadend', async () => {
            restore(fr.result as string)
        })
    })

    const [tab, setTab] = React.useState(0)
    const [qrError, setError] = React.useState<boolean>(false)

    const [json, setJson] = React.useState<null | BackupJSONFileVersion1>(null)
    const clearJson = () => {
        setJson(null)
        if (ref && ref.current) ref.current.value = ''
    }

    return (
        <WelcomeContainer {...dragEvents}>
            <Navigation back={back} />
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
            {json && (
                <Dialog scroll="body" onClose={clearJson} aria-labelledby="restore-dialog" open={json !== null}>
                    <DialogTitle id="restore-dialog">{geti18nString('welcome_1b_confirm')}</DialogTitle>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                {geti18nString('welcome_1b_hint_identity')}
                            </Typography>
                            <List>
                                {json!.whoami.map(identity => (
                                    <ListItem key={identity.userId}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <PersonIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={identity.nickname || identity.userId}
                                            secondary={identity.network}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Typography color="textSecondary" gutterBottom>
                                {geti18nString('welcome_1b_hint_network')}
                            </Typography>
                            <List dense>
                                {json!.grantedHostPermissions.map(host => (
                                    <ListItem key={host}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <LanguageIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={host} />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                        <DialogActions>
                            <Button onClick={clearJson} color="default" variant="text">
                                {geti18nString('cancel')}
                            </Button>
                            <Button onClick={() => originalRestore(json)} color="primary" variant="contained">
                                {geti18nString('welcome_1b_confirm')}
                            </Button>
                        </DialogActions>
                    </Card>
                </Dialog>
            )}
            <main className={classes.main}>
                {tab === 0 ? FileUI() : null}
                {tab === 1 ? isWKWebkit ? <WKWebkitQR onScan={restore} onQuit={() => setTab(0)} /> : QR() : null}
                {tab === 2 ? TextArea() : null}

                {tab === 2 ? (
                    <Button onClick={() => restore(textAreaRef.current!.value)} variant="contained" color="primary">
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
                        <br />
                        {geti18nString('welcome_1b_qr_error_2')}
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
