import { memo, useEffect, useRef, useState } from 'react'
import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useDropArea } from 'react-use'
import { Icons } from '@masknet/icons'
import { useMaskSharedI18N } from '../../../../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {},
    fileBox: {},
    file: {
        display: 'none',
    },
    enter: {
        color: theme.palette.text.hint,
        whiteSpace: 'pre-line',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: '0.4s',
        overflow: 'hidden',
        padding: '8px 0',
        backgroundColor: '#F7F9FA',
        '&[data-active=true]': {
            color: 'black',
        },
    },
    tips: {
        fontSize: 12,
        lineHeight: '16px',
    },
}))

export interface JsonFileBox {
    onChange: (content: string) => void
}

export const JsonFileBox = memo<JsonFileBox>(({ onChange }) => {
    const { t } = useMaskSharedI18N()
    const { classes } = useStyles()
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>()

    const [bound, { over }] = useDropArea({
        onFiles(files) {
            setFile(files[0])
        },
    })

    useEffect(() => {
        if (file) {
            file.text().then((result) => onChange(result))
        }
    }, [file, onChange])

    return (
        <div className={classes.root} {...bound}>
            <div className={classes.fileBox}>
                <input
                    className={classes.file}
                    type="file"
                    accept="application/json"
                    ref={inputRef}
                    onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                        if (currentTarget.files) setFile(currentTarget.files.item(0))
                    }}
                />
                <div className={classes.enter} data-active={over} onClick={() => inputRef.current?.click()}>
                    <Icons.File size={32} />
                    <Typography className={classes.tips}>
                        {over
                            ? t('popups_wallet_backup_json_file_drag_tip')
                            : file
                            ? file.name
                            : t('popups_wallet_backup_json_file_click_tip')}
                    </Typography>
                </div>
            </div>
        </div>
    )
})
