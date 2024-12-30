import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { Button } from '@mui/material'
import { memo, useState, type HTMLProps } from 'react'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
    },
    search: {
        background: theme.palette.maskColor.input,
        height: 40,
        borderRadius: 8,
    },
    searchButton: {
        borderRadius: 8,
    },
}))

interface Props extends HTMLProps<HTMLDivElement> {
    onSearch(keyword: string): void
}

export const SelectionSection = memo<Props>(function SelectionSection({ onSearch, className, ...rest }) {
    const { classes, cx } = useStyles()
    const [keyword, setKeyword] = useState('')
    return (
        <div className={cx(className, classes.container)} {...rest}>
            <MaskTextField
                placeholder={t`Please enter token contract address.`}
                autoFocus
                fullWidth
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key !== 'Enter') return
                    onSearch(keyword)
                }}
                InputProps={{
                    classes: { root: classes.search },
                }}
            />
            <Button
                className={classes.searchButton}
                disabled={!keyword}
                onClick={() => onSearch(keyword)}
                variant="contained">
                <Trans>Search</Trans>
            </Button>
        </div>
    )
})
