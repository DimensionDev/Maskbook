import React, { useRef, useState } from 'react'
import StepBase from './StepBase'
import { Button, Box, Typography, styled, Theme, TextField, makeStyles, createStyles } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import { useDragAndDrop } from '../../../utils/hooks/useDragAndDrop'
import { Link } from 'react-router-dom'

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
        <Button className="actionButton" variant="outlined" color="primary">
            Import Persona
        </Button>
    </>
)

const RestoreBox = styled('div')(({ theme }: { theme: Theme }) => ({
    color: theme.palette.text.hint,
    border: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'pre-line',
    width: '100%',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
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

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <FileUI></FileUI>
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
