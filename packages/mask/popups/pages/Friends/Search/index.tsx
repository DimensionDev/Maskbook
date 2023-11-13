import { memo, useState } from 'react'
import { InputBase } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { Icons } from '@masknet/icons'
import { useCurrentLinkedPersona } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    inputRoot: {
        borderRadius: 8,
        width: '100%',
        background: theme.palette.maskColor.input,
        fontSize: 14,
    },
    input: {
        '&::placeholder': {
            color: theme.palette.maskColor.third,
        },
        padding: '11px 4px !important',
    },
    inputFocused: {
        background: theme.palette.maskColor.bottom,
        borderColor: theme.palette.text.third,
    },
    button: {
        background: 'transparent',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
    },
}))

interface SearchProps {
    setSearchValue: (v: string) => void
}

export const Search = memo<SearchProps>(function Search({ setSearchValue }) {
    const { classes } = useStyles()
    const t = useMaskSharedTrans()
    const [value, setValue] = useState<string>('')
    const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
    const currentPersona = useCurrentLinkedPersona()
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter') return
        if (timer) clearTimeout(timer)
        setSearchValue(value)
    }
    return (
        <InputBase
            className={classes.inputRoot}
            classes={{
                focused: classes.inputFocused,
                input: classes.input,
            }}
            inputProps={{ className: classes.input }}
            disabled={!currentPersona}
            value={value}
            onKeyUp={(e) => handleKeyPress(e)}
            onBlur={(e) => {
                if (timer) clearTimeout(timer)
                setTimer(
                    setTimeout(() => {
                        setSearchValue(e.target.value)
                    }, 500),
                )
            }}
            onChange={(e) => {
                setValue(e.target.value)
            }}
            startAdornment={<Icons.Search />}
            endAdornment={
                value ?
                    <button
                        type="reset"
                        onClick={() => {
                            setValue('')
                            setSearchValue('')
                        }}
                        className={classes.button}>
                        <Icons.Close />
                    </button>
                :   null
            }
            placeholder={t.popups_encrypted_friends_search_placeholder()}
        />
    )
})
