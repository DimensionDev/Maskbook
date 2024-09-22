import { Icons } from '@masknet/icons'
import { getEnumAsArray } from '@masknet/kit'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { Button, styled, Typography, Tabs as MuiTabs, Tab as MuiTab, tabsClasses, tabClasses } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { downloadFile } from '../../helpers.js'
import { Provider } from '../../types.js'
import { useFileManagement } from '../contexts/index.js'
import { FileList, SelectableFileList } from './FileList.js'
import { Trans } from '@lingui/macro'

const Tabs: typeof MuiTabs = styled(MuiTabs)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.5),
    [`& .${tabsClasses.indicator}`]: {
        backgroundColor: 'transparent',
    },
}))
const Tab = styled(MuiTab)(({ theme }) => ({
    height: 34,
    minWidth: 60,
    padding: theme.spacing(0, 2),
    minHeight: 'auto',
    boxSizing: 'border-box',
    color: theme.palette.maskColor.second,
    fontSize: 14,
    fontWeight: 700,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 18,
    '&:hover': {
        color: theme.palette.maskColor.main,
    },
    [`&.${tabClasses.selected}`]: {
        color: theme.palette.maskColor.main,
        backgroundColor: theme.palette.maskColor.bg,
    },
}))

const useStyles = makeStyles()((theme) => ({
    header: {
        display: 'flex',
        alignItems: 'center',
        height: 40,
        flexShrink: 0,
        margin: theme.spacing(2, 2, 0),
    },
    tabs: {
        flexGrow: 1,
    },
    operations: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
    },
    operationButton: {
        display: 'flex',
        height: 36,
        width: 36,
        minWidth: 36,
        padding: 0,
        border: 0,
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInput: {
        flexGrow: 1,
    },
    button: {
        marginLeft: theme.spacing(2),
    },
    content: {
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        overflow: 'auto',
        boxSizing: 'border-box',
        paddingBottom: theme.spacing(2),
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    emptyBox: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMessage: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(1.5),
    },
    fileList: {
        paddingTop: theme.spacing(1.5),
        width: '100%',
        overflow: 'auto',
        flexGrow: 1,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    actions: {
        padding: theme.spacing(2, 2, 0),
        flexShrink: 0,
        boxSizing: 'border-box',
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 0px 20px rgba(0, 0, 0, 0.05)'
            :   '0px 0px 20px rgba(255, 255, 255, 0.12)',
    },
}))

enum ProviderTabs {
    All = 'All',
    IPFS = 'IPFS',
    Arweave = 'Arweave',
}

const TabToProviderMap: Record<ProviderTabs, Provider | null> = {
    [ProviderTabs.All]: null,
    [ProviderTabs.IPFS]: Provider.IPFS,
    [ProviderTabs.Arweave]: Provider.Arweave,
}

const providers = getEnumAsArray(ProviderTabs)

export function FilePicker() {
    const [params] = useSearchParams()
    const idsQuery = params.get('selectedFileIds') ?? ''
    const ids = useMemo(() => idsQuery.split(',').filter(Boolean), [idsQuery])
    return <FileBrowser key={idsQuery} selectedFileIds={ids} selectMode />
}

interface Props {
    selectMode?: boolean
    selectedFileIds?: string[]
}

export function FileBrowser({ selectMode, selectedFileIds = EMPTY_LIST }: Props) {
    const { classes } = useStyles()
    const [tab, setTab] = useState(ProviderTabs.All)
    const navigate = useNavigate()
    const { files, attachToPost } = useFileManagement()

    const [searching, setSearching] = useState(false)
    const [input, setInput] = useState('')
    const [keyword, setKeyword] = useState('')

    const visibleFiles = useMemo(() => {
        if (searching) {
            if (!keyword) return files
            const kw = keyword.toLowerCase()
            return files.filter((x) => {
                return x.name.toLowerCase().includes(kw) || x.key?.toLowerCase().includes(kw)
            })
        }
        const provider = TabToProviderMap[tab]
        if (!provider) return files
        return files.filter((x) => x.provider === provider)
    }, [files, searching, keyword, tab])

    const [selectedIds, setSelectedFileIds] = useState<string[]>(selectedFileIds)
    const selectedFiles = useMemo(() => files.filter((file) => selectedIds.includes(file.id)), [files, selectedIds])

    function renderList() {
        if (selectMode)
            return (
                <SelectableFileList
                    files={visibleFiles}
                    className={classes.fileList}
                    selectedIds={selectedIds}
                    onChange={setSelectedFileIds}
                />
            )
        return (
            <FileList
                files={visibleFiles}
                className={classes.fileList}
                onSend={attachToPost}
                onDownload={downloadFile}
            />
        )
    }

    return (
        <div className={classes.content}>
            {searching ?
                <div className={classes.header}>
                    <MaskTextField
                        wrapperProps={{ className: classes.searchInput }}
                        placeholder="Search my files"
                        value={input}
                        autoFocus
                        fullWidth
                        InputProps={{
                            style: { height: 40 },
                            inputProps: { style: { paddingLeft: 4 } },
                            startAdornment: <Icons.Search size={18} />,
                            endAdornment: input ? <Icons.Close size={18} onClick={() => setInput('')} /> : null,
                            onKeyDown: (event) => {
                                if (event.code === 'Enter') {
                                    setKeyword(event.currentTarget.value)
                                }
                            },
                            onBlur: (event) => {
                                setKeyword(event.currentTarget.value)
                            },
                        }}
                        onChange={(event) => {
                            setInput(event.currentTarget.value)
                        }}
                    />
                    <Button className={classes.button} onClick={() => setSearching(false)}>
                        <Trans>Cancel</Trans>
                    </Button>
                </div>
            :   <div className={classes.header}>
                    <div className={classes.tabs}>
                        <Tabs value={tab} onChange={(_, newTab) => setTab(newTab as ProviderTabs)}>
                            {providers.map((x) => (
                                <Tab
                                    disableRipple
                                    disableFocusRipple
                                    key={x.key}
                                    aria-label={x.key}
                                    value={x.value}
                                    label={
                                        <Typography variant="body2" fontWeight={700}>
                                            {x.value}
                                        </Typography>
                                    }
                                />
                            ))}
                        </Tabs>
                    </div>
                    <div className={classes.operations}>
                        <Button className={classes.operationButton} variant="text" onClick={() => setSearching(true)}>
                            <Icons.Search size={20} />
                        </Button>
                        <Button
                            className={classes.operationButton}
                            variant="text"
                            onClick={() => navigate(RoutePaths.UploadFile)}>
                            <Icons.Upload size={20} />
                        </Button>
                    </div>
                </div>
            }
            {visibleFiles.length ?
                renderList()
            :   <>
                    <div className={classes.emptyBox}>
                        <Icons.EmptySimple size={36} />
                        <Typography className={classes.emptyMessage}>
                            {files.length ?
                                <Trans>No results found</Trans>
                            :   <Trans>You haven't uploaded any files yet.</Trans>}
                        </Typography>
                    </div>
                    {files.length ? null : (
                        <div className={classes.actions}>
                            <Button fullWidth onClick={() => navigate(RoutePaths.UploadFile)}>
                                <Trans>Upload File</Trans>
                            </Button>
                        </div>
                    )}
                </>
            }
            {selectMode && files.length ?
                <div className={classes.actions}>
                    <Button fullWidth disabled={!selectedIds.length} onClick={() => attachToPost(selectedFiles)}>
                        <Trans>Confirm</Trans>
                    </Button>
                </div>
            :   null}
        </div>
    )
}
