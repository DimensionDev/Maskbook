import { TabList, TabPanel, TabContext, tabPanelClasses } from '@material-ui/lab'
import {
    Tab,
    experimentalStyled as styled,
    tabClasses,
    tabsClasses,
    InputBase,
    inputBaseClasses,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { useState } from 'react'
import ConfirmDialog from '../../../../components/ConfirmDialog'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import FileUpload from '../../../../components/FileUpload'
import { useAsync } from 'react-use'
import { Services } from '../../../../API'
import BackupPreviewCard from '../BackupPreviewCard'

const useStyles = makeStyles(() => ({
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
        [`&:first-of-type`]: {
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
        },
        [`&:last-of-type`]: {
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

interface RestoreDialogProps {
    open: boolean
    onClose(): void
}

export default function RestoreDialog({ open, onClose }: RestoreDialogProps) {
    const classes = useStyles()
    // tab switch
    const [tab, setTab] = useState('file')
    // paste text
    const [text, setText] = useState('')
    // file content
    const [content, setContent] = useState('')
    // parsed json
    const [json, setJSON] = useState<any>(null)

    const handleClose = () => {
        onClose()
        setTab('file')
        setText('')
        setContent('')
        setJSON(null)
    }
    const handleConfirm = async () => {
        if (!json) return

        const permissions = permission.value ?? []

        if (permissions.length) {
            const granted = await Services.Welcome.requestPermissions(permissions)
            if (!granted) return
        }

        await Services.Welcome.restoreBackup(json)
    }

    const permission = useAsync(async () => {
        const str = tab === 'file' ? content : text
        if (!str) return

        const json = await Services.Welcome.parseBackupStr(str)
        if (!json) throw new Error('invalid string')

        setJSON(json)

        return Services.Welcome.extraPermissions(json.grantedHostPermissions)
    }, [tab, text, content])

    return (
        <ConfirmDialog
            title="Restore Backups"
            confirmText="Restore"
            open={open}
            confirmDisabled={!json || permission.loading || !!permission.error}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            <div className={classes.container}>
                <TabContext value={tab}>
                    <StyledTabList onChange={(_, val) => setTab(val)}>
                        <StyledTab label="File" value="file" />
                        <StyledTab label="Text" value="text" />
                    </StyledTabList>
                    <StyledTabPanel value="file">
                        <div className={json && content ? classes.hide : ''}>
                            <FileUpload height={180} readAsText onChange={(_, content) => setContent(content || '')} />
                        </div>
                        <div className={json && content ? '' : classes.hide}>
                            <BackupPreviewCard json={json} />
                        </div>
                    </StyledTabPanel>
                    <StyledTabPanel value="text">
                        <div className={json && text ? classes.hide : ''}>
                            <TextArea
                                value={text}
                                onChange={(event) => setText(event.target.value)}
                                fullWidth
                                multiline
                                maxRows={6}
                                placeholder="Paste the database backup as text here..."
                            />
                        </div>
                        <div className={json && text ? '' : classes.hide}>
                            <BackupPreviewCard json={json} />
                        </div>
                    </StyledTabPanel>
                </TabContext>
            </div>
        </ConfirmDialog>
    )
}
