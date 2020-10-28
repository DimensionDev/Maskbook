import React from 'react'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    DialogContent,
    TextField,
    Typography,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { InjectedDialog } from './InjectedDialog'
import { Autocomplete } from '@material-ui/lab'
import { editMetadata, isDataMatchJSONSchema, metadataSchemaStoreReadonly } from '../../protocols/typed-message'
import { ShadowRootPopper } from '../../utils/shadow-root/ShadowRootPopper'
import { useState } from 'react'

export interface DebugMetadataInspectorProps {
    meta: ReadonlyMap<string, any>
    onExit: () => void
    onNewMetadata?(newMeta: ReadonlyMap<string, any>): void
}

export function DebugMetadataInspector(props: DebugMetadataInspectorProps) {
    const { meta, onExit, onNewMetadata } = props
    const [field, setField] = useState('')
    const [content, setContent] = useState('{}')

    const knownMetadata = [...metadataSchemaStoreReadonly.keys()]
    const result = isValid(content)
    const isInvalid = result !== true
    const editor = onNewMetadata ? (
        <Card variant="outlined">
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    Add new metadata or replace existing metadata
                </Typography>
                <form>
                    <Autocomplete
                        autoComplete
                        freeSolo
                        options={knownMetadata}
                        inputValue={field}
                        onInputChange={(_, newValue) => setField(newValue)}
                        PopperComponent={ShadowRootPopper}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                spellCheck={false}
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                fullWidth
                                label="Metadata Key"
                                margin="normal"
                            />
                        )}
                    />
                    <TextField
                        label="Metadata content"
                        value={content}
                        onChange={(e) => setContent(e.currentTarget.value)}
                        multiline
                        fullWidth
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        error={isInvalid}
                        helperText={<span style={{ whiteSpace: 'pre-wrap' }}>{result}</span>}
                    />
                </form>
            </CardContent>
            <CardActions>
                <Button
                    onClick={() => onNewMetadata(editMetadata(meta, (meta) => meta.set(field, JSON.parse(content))))}
                    size="small"
                    variant="contained"
                    disabled={isInvalid || field?.length <= 3}>
                    Put metadata
                </Button>
                <Button
                    onClick={() => {
                        setField('')
                        setContent('{}')
                    }}
                    size="small"
                    variant="text">
                    Clear
                </Button>
            </CardActions>
        </Card>
    ) : null
    return (
        <InjectedDialog open title="Debug: Metadata Inspector" onExit={onExit}>
            <DialogContent>
                {editor}
                {[...props.meta].map(([key, content]) => {
                    const editButton = onNewMetadata ? (
                        <>
                            <Button
                                variant="contained"
                                size="small"
                                color="secondary"
                                onClick={() => {
                                    setField(key)
                                    setContent(JSON.stringify(content, undefined, 4))
                                }}>
                                Edit
                            </Button>
                            <Button
                                variant="text"
                                size="small"
                                color="secondary"
                                onClick={() => onNewMetadata(editMetadata(meta, (meta) => meta.delete(key)))}>
                                Delete
                            </Button>
                        </>
                    ) : null
                    return (
                        <Accordion key={key}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography style={{ alignSelf: 'center' }}>{key}</Typography>
                                <Box flex={1} />
                                <Typography onClick={(e) => e.stopPropagation()}>{editButton}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography
                                    component="code"
                                    children={JSON.stringify(content, undefined, 4)}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                            </AccordionDetails>
                        </Accordion>
                    )
                })}
            </DialogContent>
        </InjectedDialog>
    )

    function isValid(newData: string) {
        try {
            JSON.parse(newData)
        } catch {
            return 'Invalid JSON'
        }
        const validator = metadataSchemaStoreReadonly.get(field)
        if (validator) {
            const valid = isDataMatchJSONSchema(JSON.parse(newData), validator)
            if (valid.err) return 'Metadata content is invalid:\n' + valid.val.map((x) => '    ' + x.message).join('\n')
        }
        return true
    }
}
