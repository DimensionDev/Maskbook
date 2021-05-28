import { TabList, TabPanel, TabContext, tabPanelClasses } from '@material-ui/lab'
import { Tab, experimentalStyled as styled, tabClasses, tabsClasses, InputBase } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { useState } from 'react'
import ConfirmDialog from '../../../../components/ConfirmDialog'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import FileUpload from '../../../../components/FileUpload'

const useStyles = makeStyles(() => ({
    container: { flex: 1 },
}))

const SyledTabList = styled(TabList)(() => ({
    [`& .${tabsClasses.indicator}`]: {
        display: 'none',
    },
}))

const StyledTab = styled(Tab)(() => ({
    [`&.${tabClasses.root}`]: {
        flex: 1,
        background: MaskColorVar.secondaryBackground,
        textTransform: 'none',
        [`&:first-child`]: {
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
        },
        [`&:last-child`]: {
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
        },
        [`&.${tabClasses.selected}`]: {
            color: MaskColorVar.primaryContrastText,
            background: MaskColorVar.primary,
        },
    },
}))

const StyledTabPanel = styled(TabPanel)(({ theme }) => ({
    [`&.${tabPanelClasses.root}`]: {
        marginTop: theme.spacing(2.5),
        background: MaskColorVar.secondaryBackground,
        borderRadius: 8,
        height: 180,
    },
}))

interface RestoreDialogProps {
    open: boolean
    onClose(): void
}

export default function RestoreDialog({ open, onClose }: RestoreDialogProps) {
    const classes = useStyles()
    const [loading, setLoading] = useState(true)
    // tab switch
    const [value, setValue] = useState('1')
    // paste text
    const [text, setText] = useState('')
    // upload file
    const [file, setFile] = useState()
    // backup content
    const [content, setContent] = useState('')
    const handleClose = () => {
        onClose()
    }
    const handleConfirm = () => {}
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue)
    }
    const handleFileChange = (file: File, content?: string) => {
        console.log(file, content)
    }
    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value)
    }
    return (
        <ConfirmDialog
            title="Restore Backups"
            confirmText="Restore"
            open={open}
            confirmDisabled={loading}
            onClose={handleClose}
            onConfirm={handleConfirm}>
            <div className={classes.container}>
                <TabContext value={value}>
                    <SyledTabList onChange={handleChange}>
                        <StyledTab label="File" value="1" />
                        <StyledTab label="Text" value="2" />
                    </SyledTabList>
                    <StyledTabPanel value="1">
                        <FileUpload readAsText onChange={handleFileChange} />
                    </StyledTabPanel>
                    <StyledTabPanel value="2">
                        <InputBase
                            value={text}
                            onChange={handleTextChange}
                            fullWidth
                            multiline
                            maxRows={6}
                            placeholder="Paste the database backup as text here..."
                        />
                    </StyledTabPanel>
                </TabContext>
            </div>
        </ConfirmDialog>
    )
}
