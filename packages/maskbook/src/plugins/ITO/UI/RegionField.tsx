import type { ChangeEvent } from 'react'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { TextField, BaseTextFieldProps, MenuItem, Checkbox, ListItemText } from '@material-ui/core'
import { useRegionList } from '../hooks/useRegion'
import type { RegionCode } from '../hooks/useRegion'
import { usePortalShadowRoot } from '../../../utils/shadow-root/usePortalShadowRoot'

export interface RegionFieldProps extends BaseTextFieldProps {
    value: RegionCode[]
    onChange: (codes: RegionCode[]) => void
}

const useStyles = makeStyles((theme) =>
    createStyles({
        span: {
            paddingLeft: theme.spacing(2),
        },
    }),
)

export function RegionField({ value = [], onChange, ...props }: RegionFieldProps) {
    const classes = useStyles()
    const allRegions = useRegionList()
    const handleChange = (event: ChangeEvent<{ value: unknown }>) => {
        onChange(event.target.value as RegionCode[])
    }

    return usePortalShadowRoot((container) => {
        const selectProps = {
            multiple: true,
            value: value,
            onChange: handleChange,
            renderValue: (selected: unknown) => <span>{(selected as RegionCode[]).join(', ')}</span>,
            MenuProps: {
                container,
                PaperProps: {
                    style: {
                        maxHeight: 300,
                        width: 250,
                    },
                },
            },
        }

        return (
            <TextField select SelectProps={selectProps} onChange={handleChange} {...props}>
                {allRegions.map((region) => (
                    <MenuItem key={region.code} value={region.code}>
                        <Checkbox checked={value.indexOf(region.code) > -1} />
                        <ListItemText>
                            <span>{countryToFlag(region.code)}</span>
                            <span className={classes.span}>{region.name}</span>
                        </ListItemText>
                    </MenuItem>
                ))}
            </TextField>
        )
    })
}

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
function countryToFlag(isoCode: string) {
    return typeof String.fromCodePoint !== 'undefined'
        ? isoCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
        : isoCode
}
