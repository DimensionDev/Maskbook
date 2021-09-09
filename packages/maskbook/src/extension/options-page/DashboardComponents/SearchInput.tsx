import { SearchIcon } from '@masknet/icons'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { IconButton, InputBase, Paper, Typography } from '@material-ui/core'
import { useState } from 'react'

const useStyles = makeStyles()((theme) => ({
    searchbox: {
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        border: `1px solid ${getMaskColor(theme).border}`,
        alignItems: 'center',
        boxSizing: 'border-box',
        padding: theme.spacing(1),
    },
    search: {
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        width: '100%',
    },
    iconButton: {
        padding: theme.spacing(0.5),
    },
    label: {
        width: '100%',
        paddingLeft: theme.spacing(1),
    },
}))

export interface SearchInputProps {
    label: string
    onChange?: (keyword: string) => void
}
export function SearchInput({ label, onChange }: SearchInputProps) {
    const { classes } = useStyles()
    const [visible, setVisible] = useState(false)
    const [keyword, setKeyword] = useState('')

    return (
        <Paper className={classes.searchbox} elevation={0}>
            {visible ? (
                <Typography variant="body2" className={classes.label}>
                    {label}
                </Typography>
            ) : null}
            <Paper component="form" className={classes.search} elevation={0}>
                <IconButton size="large" className={classes.iconButton} aria-label="label">
                    <SearchIcon />
                </IconButton>
                <InputBase
                    className={classes.input}
                    inputProps={{ 'aria-label': 'select a token' }}
                    placeholder={label}
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value)
                        setVisible(e.target.value.length !== 0)
                        onChange?.(e.target.value)
                    }}
                />
            </Paper>
        </Paper>
    )
}
