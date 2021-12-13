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
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { InjectedDialog } from './InjectedDialog'
import { Autocomplete } from '@mui/material'
import { isDataMatchJSONSchema, metadataSchemaStoreReadonly } from '../../protocols/typed-message'
import { ShadowRootPopper } from '../../utils/shadow-root/ShadowRootComponents'
import { useState } from 'react'
import { useI18N } from '../../utils'

export interface DebugMetadataInspectorProps {
    meta: ReadonlyMap<string, any>
    onExit: () => void
    onNewMeta?(meta: string, value: unknown): void
    onDeleteMeta?(meta: string): void
}

export function DebugMetadataInspector(props: DebugMetadataInspectorProps) {
    const { meta, onExit, onDeleteMeta, onNewMeta } = props
    const [field, setField] = useState('')
    const [content, setContent] = useState('{}')
    const { t } = useI18N()

    const knownMetadata = [...metadataSchemaStoreReadonly.keys()]
    const result = isValid(content)
    const isInvalid = result !== true
    const editor = onNewMeta ? (
        <Card variant="outlined">
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {t('debug_metadata_title')}
                </Typography>
                <form>
                    <Autocomplete
                        sx={{ marginBottom: 2 }}
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
                                variant="standard"
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
                        variant="standard"
                    />
                </form>
            </CardContent>
            <CardActions>
                <Button
                    onClick={() => onNewMeta(field, JSON.parse(content))}
                    size="small"
                    variant="contained"
                    disabled={isInvalid || field?.length <= 3}>
                    {t('debug_metadata_put_metadata')}
                </Button>
                <Button
                    onClick={() => {
                        setField('')
                        setContent('{}')
                    }}
                    size="small"
                    variant="text">
                    {t('clear')}
                </Button>
            </CardActions>
        </Card>
    ) : null
    return (
        <InjectedDialog open title="Debug: Metadata Inspector" onClose={onExit}>
            <DialogContent>
                {editor}
                {[...meta].map(([key, content]) => {
                    return (
                        <Accordion key={key}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography style={{ alignSelf: 'center' }}>{key}</Typography>
                                <Box sx={{ flex: 1 }} />
                                <Typography onClick={(e) => e.stopPropagation()}>
                                    {onNewMeta ? (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="secondary"
                                            onClick={() => {
                                                setField(key)
                                                setContent(JSON.stringify(content, undefined, 4))
                                            }}>
                                            {t('edit')}
                                        </Button>
                                    ) : null}

                                    {onDeleteMeta ? (
                                        <Button
                                            variant="text"
                                            size="small"
                                            color="secondary"
                                            onClick={() => onDeleteMeta(key)}>
                                            {t('delete')}
                                        </Button>
                                    ) : null}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{ display: 'flex' }}>
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
