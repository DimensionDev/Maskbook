import { Box, IconButton, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { SearchIcon } from '@masknet/icons'
import ClearIcon from '@mui/icons-material/Clear'
import { TwitterIcon } from '../../icons/TwitterIcon'
import { UrlIcon } from '../../icons/UrlIcon'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui'

const useStyles = makeStyles()((theme) => {
    return {
        box: {
            margin: theme.spacing(1, 1.8),
            paddingBottom: theme.spacing(0),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        textField: {
            margin: theme.spacing(1, 0.5, 1),
            '& .MuiSvgIcon-root': {
                marginRight: theme.spacing(0.5),
            },
            '& .MuiInput-input': {
                fontSize: 13.125,
            },
            '& .MuiInput-underline:before': {
                borderColor: 'divider',
            },
        },
        toolbarIcon: {
            width: 16,
            marginRight: theme.spacing(0.3),
        },
        toggleButton: {
            textTransform: 'unset',
            padding: theme.spacing(0.7),
        },
    }
})

interface QuickSearchToolbarProps {
    value: string
    clearSearch: () => void
    onChange: () => void
    filters: string[]
    setFilters: (newFilters: string[]) => void
}

export function QuickSearchToolbar(props: QuickSearchToolbarProps) {
    const { classes } = useStyles()
    const { t } = useI18N()

    const handleFilters = (event: React.MouseEvent<HTMLElement>, newFilters: string[]) => {
        props.setFilters(newFilters)
    }

    return (
        <Box className={classes.box}>
            <ToggleButtonGroup
                color="primary"
                value={props.filters}
                onChange={handleFilters}
                aria-label="token filter by type">
                <ToggleButton className={classes.toggleButton} size="small" value="0x6" aria-label="url">
                    <UrlIcon className={classes.toolbarIcon} />
                    <Typography variant="body2">{t('plugin_ideamarket_urls')}</Typography>
                </ToggleButton>
                <ToggleButton className={classes.toggleButton} size="small" value="0x1" aria-label="user">
                    <TwitterIcon className={classes.toolbarIcon} />
                    <Typography variant="body2">{t('plugin_ideamarket_users')}</Typography>
                </ToggleButton>
            </ToggleButtonGroup>
            <TextField
                className={classes.textField}
                variant="standard"
                value={props.value}
                onChange={props.onChange}
                placeholder="Search&#x2026;"
                InputProps={{
                    startAdornment: <SearchIcon fontSize="small" />,
                    endAdornment: (
                        <IconButton
                            title="Clear"
                            aria-label="Clear"
                            size="small"
                            style={{ visibility: props.value ? 'visible' : 'hidden' }}
                            onClick={props.clearSearch}>
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    ),
                }}
            />
        </Box>
    )
}
