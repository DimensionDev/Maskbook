import { type BackupSummary } from '@masknet/backup-format'
import { MaskColorVar, makeStyles } from '@masknet/theme'
import { TabContext, TabList, TabPanel, tabPanelClasses } from '@mui/lab'
import { InputBase, Tab, inputBaseClasses, styled, tabClasses, tabsClasses } from '@mui/material'
import { useState } from 'react'
import { useAsync } from 'react-use'
import Services from '#services'
import ConfirmDialog from '../../../../components/ConfirmDialog/index.js'
import FileUpload from '../../../../components/FileUpload/index.js'
import { BackupPreview } from '../BackupPreview.js'

const useStyles = makeStyles()(() => ({
    container: { flex: 1 },
    hide: { display: 'none' },
}))

const StyledTabList: typeof TabList = styled(TabList)(() => ({
    [`& .${tabsClasses.indicator}`]: {
        display: 'none',
    },
})) as any

const StyledTab: typeof Tab = styled(Tab)(() => ({
    [`&.${tabClasses.root}`]: {
        flex: 1,
        background: MaskColorVar.secondaryBackground,
        textTransform: 'none',
        '&:first-of-type': {
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
        },
        '&:last-of-type': {
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
        },
        [`&.${tabClasses.selected}`]: {
            color: MaskColorVar.primaryContrastText,
            background: MaskColorVar.primary,
        },
    },
})) as any

const StyledTabPanel = styled(TabPanel)(({ theme }) => ({
    [`&.${tabPanelClasses.root}`]: {
        marginTop: theme.spacing(2.5),
        padding: 0,
    },
}))

const TextArea = styled(InputBase)(({ theme }) => ({
    [`&.${inputBaseClasses.root}`]: {
        height: 180,
        alignItems: 'flex-start',
        background: MaskColorVar.secondaryBackground,
        borderRadius: 8,
        padding: theme.spacing(2),
    },
}))

export interface RestoreDialogProps {
    open: boolean
    onClose(): void
}

export default function RestoreDialog({ open, onClose }: RestoreDialogProps) {
    const { classes } = useStyles()
    // tab switch
    const [tab, setTab] = useState('file')
    // paste text
    const [text, setText] = useState('')
    // file content
    const [content, setContent] = useState('')
    const [preview, setPreview] = useState<BackupSummary | null>(null)
    // backup id

    const handleClose = () => {
        onClose()
        setTab('file')
        setText('')
        setContent('')
        setPreview(null)
    }
    const handleConfirm = async () => {
        if (!preview) return
        const str = tab === 'file' ? content : text
        await Services.Backup.restoreBackup(str)
    }

    useAsync(async () => {
        const str = tab === 'file' ? content : text

        const summary = await Services.Backup.generateBackupSummary(str)
        if (summary.isOk()) {
            setPreview(summary.value)
        } else {
            setPreview(null)
        }
    }, [tab, text, content])

    return (
        <ConfirmDialog
            title="Restore Backups"
            confirmText="Restore"
            open={open}
            confirmDisabled={!preview}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            <div className={classes.container}>
                <TabContext value={tab}>
                    <StyledTabList onChange={(_, val) => setTab(val)}>
                        <StyledTab label="File" value="file" />
                        <StyledTab label="Text" value="text" />
                    </StyledTabList>
                    <StyledTabPanel value="file">
                        <div className={preview && content ? classes.hide : ''}>
                            <FileUpload height={180} readAsText onChange={(_, content) => setContent(content || '')} />
                        </div>
                        {preview && content ? <BackupPreview info={preview} /> : null}
                    </StyledTabPanel>
                    <StyledTabPanel value="text">
                        <div className={preview && text ? classes.hide : ''}>
                            <TextArea
                                value={text}
                                onChange={(event) => setText(event.target.value)}
                                fullWidth
                                multiline
                                maxRows={6}
                                placeholder="Paste the database backup as text here..."
                            />
                        </div>
                        {preview && text ? <BackupPreview info={preview} /> : null}
                    </StyledTabPanel>
                </TabContext>
            </div>
        </ConfirmDialog>
    )
}
