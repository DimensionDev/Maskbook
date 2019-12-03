import React, { useRef, useState } from 'react'
import StepBase from './StepBase'
import {
    Button,
    Box,
    Typography,
    styled,
    Theme,
    TextField,
    makeStyles,
    createStyles,
    InputBase,
} from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import { useDragAndDrop } from '../../../utils/hooks/useDragAndDrop'
import { Link } from 'react-router-dom'
import BackupRestoreTab, { BackupRestoreTabProps } from '../DashboardComponents/BackupRestoreTab'

const header = 'Restore Database'

const useStyles = makeStyles(theme =>
    createStyles({
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
        restoreBoxButton: {
            alignSelf: 'center',
            width: '180px',
            boxShadow: 'none',
            marginBottom: theme.spacing(1),
        },
    }),
)

const actions = (
    <>
        <Button className="actionButton" variant="outlined" color="default" component={Link} to="start">
            Back
        </Button>
        <Button className="actionButton" variant="outlined" color="primary" component={Link} to="1ra">
            Advanced...
        </Button>
    </>
)

const RestoreBox = styled('div')(({ theme }: { theme: Theme }) => ({
    color: theme.palette.text.hint,
    whiteSpace: 'pre-line',
    width: '100%',
    height: '100%',
    minHeight: 180,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
}))

export default function InitStep1R() {
    const [name, setName] = useState('')
    const ref = React.useRef<HTMLInputElement>(null)
    const classes = useStyles()
    const [fileContent, setFileContent] = React.useState('')
    const { dragEvents, fileReceiver, fileRef, dragStatus } = useDragAndDrop(file => {
        const fr = new FileReader()
        fr.readAsText(file)
        fr.addEventListener('loadend', async () => {
            setFileContent(fr.result as string)
        })
    })

    const textValue =
        'WFceyl2VOyvyeaqkTodUI1XulcXQkRVQvh3U65vvMUuRq2ln9ozlECaZYLkKq9HHWKucm9sc2e52y32I1FoikgstIsV1l/S5VwbvELkchC5Mh5eAbcSGCRotC9TfIBUlGwwwnaMZ8tNgo0jBxPgOeU2ikdoIrgkrIiMXYUe6nz/AmvbYDYBjuqNnArVpxILOuJ6ytKUZGaadrI3sct+rFHqK20YFAyjuZrBgSIkNrBcx5epysj2dKpnRd4zyLoRlJQ'

    const state = useState(0)
    const tabProps: BackupRestoreTabProps = {
        tabs: [
            {
                label: 'File',
                component: <FileUI></FileUI>,
                p: 0,
            },
            {
                label: 'TEXT',
                component: (
                    <InputBase
                        style={{ width: '100%', minHeight: '100px' }}
                        multiline
                        defaultValue={textValue}
                        readOnly></InputBase>
                ),
            },
        ],
        state,
    }

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <BackupRestoreTab {...tabProps}></BackupRestoreTab>
        </div>
    )

    function FileUI() {
        return (
            <>
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
                    {dragStatus === 'drag-enter' ? (
                        geti18nString('welcome_1b_dragging')
                    ) : fileRef.current ? (
                        geti18nString('welcome_1b_file_selected', fileRef.current.name)
                    ) : (
                        <>
                            <Button variant="contained" color="primary" className={classes.restoreBoxButton}>
                                Select File
                            </Button>
                            <Typography variant="body2">Or drop a file here...</Typography>
                        </>
                    )}
                </RestoreBox>
            </>
        )
    }

    return (
        <StepBase header={header} actions={actions}>
            {content}
        </StepBase>
    )
}
