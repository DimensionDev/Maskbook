import { memo, useState } from 'react'
import { InputBase } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useCurrentLinkedPersona } from '@masknet/shared'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { _ } = useLingui()
    const { classes } = useStyles()
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
            placeholder={_(msg`Search Next.ID, X, Lens, ENS or Address`)}
        />
    )
})
