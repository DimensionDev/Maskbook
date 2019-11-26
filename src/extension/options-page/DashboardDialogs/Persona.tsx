import React, { useState } from 'react'
import { DialogContentItem } from './DialogBase'

import { Button, TextField, Typography, AppBar, Tabs, Tab, Box, InputBase } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import ProviderLine from '../DashboardComponents/Provider'

const TabPanel = (props: any) => {
    const { children, value, index, ...other } = props

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}>
            <Box p={3}>{children}</Box>
        </Typography>
    )
}

export function PersonaCreateDialog() {
    const [name, setName] = useState('')

    const content = (
        <div style={{ alignSelf: 'stretch', textAlign: 'center', width: '100%' }}>
            <TextField
                style={{ width: '100%', maxWidth: '320px' }}
                autoFocus
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                label="Name"></TextField>
        </div>
    )

    return (
        <DialogContentItem
            title="Create Persona"
            content={content}
            actionsAlign="center"
            actions={
                <Button
                    className="actionButton"
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`created?name=${name}`}>
                    Ok
                </Button>
            }></DialogContentItem>
    )
}

export function PersonaCreatedDialog() {
    const history = useHistory()
    const search = new URLSearchParams(history.location.search)
    const name = search.get('name')
    return (
        <DialogContentItem
            title="Persona Created"
            content={
                <>
                    {`New persona «${name}» has been created. Connect a profile now! ([I:b])`}
                    <section style={{ marginTop: 12 }}>
                        <ProviderLine network="facebook" border></ProviderLine>
                        <ProviderLine network="twitter" border></ProviderLine>
                    </section>
                </>
            }></DialogContentItem>
    )
}

export function PersonaDeleteDialog() {
    const history = useHistory()
    const search = new URLSearchParams(history.location.search)
    const name = search.get('name')
    return (
        <DialogContentItem
            simplified
            title="Delete Persona"
            content={`Do you really want to delete persona "${name}"? This operation cannot be reverted.`}
            actions={
                <>
                    <Button className="actionButton" variant="outlined" color="default" component={Link} to="../">
                        Cancel
                    </Button>
                    <Button className="actionButton" variant="contained" color="primary">
                        Ok
                    </Button>
                </>
            }></DialogContentItem>
    )
}

export function PersonaBackupDialog() {
    const [value, setValue] = React.useState(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue)
    }

    const mnemonicWordValue = 'the natural law of privacy is now enforced by tessercube and maskbook'
    const base64Value =
        'WFceyl2VOyvyeaqkTodUI1XulcXQkRVQvh3U65vvMUuRq2ln9ozlECaZYLkKq9HHWKucm9sc2e52y32I1FoikgstIsV1l/S5VwbvELkchC5Mh5eAbcSGCRotC9TfIBUlGwwwnaMZ8tNgo0jBxPgOeU2ikdoIrgkrIiMXYUe6nz/AmvbYDYBjuqNnArVpxILOuJ6ytKUZGaadrI3sct+rFHqK20YFAyjuZrBgSIkNrBcx5epysj2dKpnRd4zyLoRlJQ'

    const content = (
        <>
            <Typography variant="body1">You can backup the persona with either way below.</Typography>
            <div>
                <AppBar position="static" color="default" elevation={0}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth">
                        <Tab label="MNEMONIC WORDS" />
                        <Tab label="BASE64" />
                    </Tabs>
                </AppBar>
                <TabPanel value={value} index={0}>
                    <InputBase
                        style={{ width: '100%', minHeight: '100px' }}
                        multiline
                        defaultValue={mnemonicWordValue}
                        readOnly></InputBase>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <InputBase
                        style={{ width: '100%', minHeight: '100px' }}
                        multiline
                        defaultValue={base64Value}
                        readOnly></InputBase>
                </TabPanel>
            </div>
            <Typography variant="body2">
                Keep the 12 words above carefully in a safe place. You will need them to restore the private key of this
                persona.
            </Typography>
        </>
    )

    return <DialogContentItem title="Backup Persona" content={content}></DialogContentItem>
}

export function PersonaImportDialog() {
    const [value, setValue] = React.useState(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue)
    }
    const content = (
        <>
            <Typography variant="body1">You can backup the persona with either way below.</Typography>
            <div>
                <AppBar position="static" color="default" elevation={0}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth">
                        <Tab label="MNEMONIC WORDS" />
                        <Tab label="BASE64" />
                    </Tabs>
                </AppBar>
                <TabPanel value={value} index={0}>
                    <InputBase style={{ width: '100%', minHeight: '100px' }} multiline></InputBase>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <InputBase style={{ width: '100%', minHeight: '100px' }} multiline></InputBase>
                </TabPanel>
            </div>
        </>
    )
    return (
        <DialogContentItem
            simplified
            title="Import Persona"
            content={content}
            actions={
                <Button className="actionButton" variant="contained" color="primary" component={Link} to="../">
                    Import
                </Button>
            }></DialogContentItem>
    )
}

export function PersonaImportFailedDialog() {
    return (
        <DialogContentItem
            simplified
            title="Import Failure"
            content="Your import data is invalid. Please check again."
            actions={
                <Button className="actionButton" variant="outlined" color="default" component={Link} to="../">
                    Ok
                </Button>
            }></DialogContentItem>
    )
}
export function PersonaImportSuccessDialog() {
    return (
        <DialogContentItem
            simplified
            title="Import Successful"
            content={`Imported persona ${`Yisi Liu`} with 2 profiles.`}
            actions={
                <Button className="actionButton" variant="outlined" color="default" component={Link} to="../">
                    Ok
                </Button>
            }></DialogContentItem>
    )
}
