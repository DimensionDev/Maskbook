import { useEffect, useRef, useState } from 'react'
import { useAsync, useDropArea } from 'react-use'
import { Button, makeStyles } from '@material-ui/core'
import { RestoreBox } from './RestoreBox'
import { blobToText } from '@dimensiondev/kit'
import { useDashboardI18N } from '../../locales'
import { EncryptedFileIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import { Services } from '../../API'
import { ControlContainer } from './index'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'
import { PersonaInfo, PersonaSelector } from './PersonaSelector'
import { MaskAlert } from '../MaskAlert'

const useStyles = makeStyles((theme) => ({
    root: {
        border: `solid 1px ${theme.palette.divider}`,
        width: '100%',
        height: 176,
        borderRadius: 4,
        background: MaskColorVar.secondaryContrastText.alpha(0.15),
    },
    file: {
        display: 'none',
    },
    alter: {
        marginTop: theme.spacing(6),
        width: '100%',
    },
}))

enum RestoreStatus {
    WaitingInput,
    SelectIdentity,
    Verifying,
    Verified,
}

export interface RestoreFromJsonProps {}

export function RestoreFromJson(props: RestoreFromJsonProps) {
    const t = useDashboardI18N()
    const classes = useStyles()

    const [json, setJSON] = useState<any | null>(null)
    const [backupValue, setBackupValue] = useState('')
    const [backupId, setBackupId] = useState('')
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.WaitingInput)
    const [selectIdentifier, setSelectIdentifier] = useState('')
    const [personas, setPersonas] = useState<PersonaInfo[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [bound, { over }] = useDropArea({
        onFiles(files) {
            setFile(files[0])
        },
    })

    useEffect(() => {
        if (file) {
            blobToText(file).then((result) => setBackupValue(result))
        }
    }, [file])

    useAsync(async () => {
        if (!backupValue) return
        setRestoreStatus(RestoreStatus.Verifying)

        const backupJson = await Services.Welcome.decompressBackupFileForV3(backupValue)
        if (backupJson._meta_.version !== 3) {
            setRestoreStatus(RestoreStatus.SelectIdentity)
            setPersonas(
                backupJson.personas
                    .filter((persona) => persona.nickname)
                    .map((persona) => {
                        return {
                            ...persona,
                            linkedProfiles: persona.linkedProfiles.map((x) => {
                                const profile = backupJson.profiles.find(
                                    (profile) =>
                                        profile.linkedPersona === persona.identifier && x[0] === profile.identifier,
                                )!
                                return {
                                    identifier: profile.identifier,
                                    nickname: profile.nickname,
                                }
                            }),
                        }
                    }),
            )
        }
    }, [backupValue])

    useAsync(async () => {
        if (!selectIdentifier) return

        const backupInfo = await Services.Welcome.parseBackupStr(backupValue, selectIdentifier)
        if (backupInfo) {
            setJSON(backupInfo.info)
            setBackupId(backupInfo.id)
            setRestoreStatus(RestoreStatus.Verified)
        } else {
            setRestoreStatus(RestoreStatus.WaitingInput)
        }
    }, [selectIdentifier])

    const restoreDB = async () => {
        await Services.Welcome.checkPermissionsAndRestore(backupId)
    }

    return (
        <>
            {restoreStatus === RestoreStatus.Verifying && <div className={classes.root}>Verifying</div>}
            {restoreStatus === RestoreStatus.SelectIdentity && (
                <div className={classes.root}>
                    {
                        <PersonaSelector
                            personas={personas}
                            onSubmit={(identifier: string) => setSelectIdentifier(identifier)}
                        />
                    }
                </div>
            )}
            {restoreStatus === RestoreStatus.WaitingInput && (
                <div className={classes.root} {...bound}>
                    <input
                        className={classes.file}
                        type="file"
                        accept="application/json"
                        ref={inputRef}
                        onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                            if (currentTarget.files) setFile(currentTarget.files.item(0))
                        }}
                        data-testid="file_input"
                    />
                    <RestoreBox
                        file={file}
                        entered={over}
                        enterText={t.personas_rename()}
                        leaveText={t.personas()}
                        darkPlaceholderIcon={<EncryptedFileIcon />}
                        lightPlaceholderIcon={<EncryptedFileIcon />}
                        data-active={over}
                        onClick={() => inputRef.current && inputRef.current.click()}
                    />
                </div>
            )}
            {restoreStatus === RestoreStatus.Verified && <BackupPreviewCard json={json} />}
            <ControlContainer>
                <Button color="secondary">{t.wallets_import_wallet_cancel()}</Button>
                <Button color="primary" onClick={restoreDB} disabled={restoreStatus !== RestoreStatus.Verified}>
                    {t.wallets_import_wallet_import()}
                </Button>
            </ControlContainer>
            <div className={classes.alter}>
                <MaskAlert description={t.sign_in_account_local_backup_warning()} />
            </div>
        </>
    )
}
