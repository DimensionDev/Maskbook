import { useState, useRef, useEffect } from 'react'
import { useDropArea } from 'react-use'
import { makeStyles } from '@material-ui/core'
import { RestoreBox } from './RestoreBox'
import { blobToText } from '@dimensiondev/kit'
import { useDashboardI18N } from '../../locales'
import { EncryptedFileIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'

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
}))

export interface RestoreFromJsonProps {}

export function RestoreFromJson(props: RestoreFromJsonProps) {
    const t = useDashboardI18N()
    const classes = useStyles()

    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [bound, { over }] = useDropArea({
        onFiles(files) {
            setFile(files[0])
        },
    })

    const handleChange = (file: File, content: string) => {}

    useEffect(() => {
        if (file) {
            blobToText(file).then((result) => handleChange(file, result))
        }
    }, [file])

    return (
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
                enterText={t.sign_in_account_local_backup_file_drag()}
                leaveText={t.sign_in_account_local_backup_file_drag()}
                darkPlaceholderIcon={<EncryptedFileIcon />}
                lightPlaceholderIcon={<EncryptedFileIcon />}
                data-active={over}
                onClick={() => inputRef.current && inputRef.current.click()}
            />
        </div>
    )
}
