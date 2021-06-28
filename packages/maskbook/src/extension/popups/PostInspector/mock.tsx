import { useValueRef } from '@masknet/shared'
import { debugModeSetting } from '../../../settings/settings'
import { Box, FormControl, TextField, InputLabel, MenuItem, Select } from '@material-ui/core'
import { CurrentSNSNetwork } from '@masknet/plugin-infra'

type State<T> = [T, (newValue: T) => void]
export interface MockProps {
    network: State<CurrentSNSNetwork>
    author: State<string>
    id: State<string>
    content: State<string>
    image: State<string>
}
export function Mock(props: MockProps) {
    const isDebugging = useValueRef(debugModeSetting)
    if (!isDebugging) return null
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: '50vw',
                marginTop: '2em',
            }}>
            <FormControl>
                <InputLabel>SNS Adaptor</InputLabel>
                <Select variant="standard" sx={{ minWidth: 250 }} value={props.network[0]}>
                    <MenuItem value={CurrentSNSNetwork.Twitter}>Twitter</MenuItem>
                    <MenuItem value={CurrentSNSNetwork.Facebook}>Facebook</MenuItem>
                    <MenuItem value={CurrentSNSNetwork.Instagram}>Instagram</MenuItem>
                    <MenuItem value={CurrentSNSNetwork.Minds}>Minds.io</MenuItem>
                    <MenuItem value={CurrentSNSNetwork.Unknown}>Unknown</MenuItem>
                </Select>
            </FormControl>
            <TextField
                variant="standard"
                label="Post ID"
                value={props.id[0]}
                onChange={(e) => props.id[1](e.currentTarget.value)}
            />
            <TextField
                variant="standard"
                label="Post Author"
                value={props.author[0]}
                onChange={(e) => props.author[1](e.currentTarget.value)}
            />
            <TextField
                variant="standard"
                label="Post content"
                multiline
                value={props.content[0]}
                onChange={(e) => props.content[1](e.currentTarget.value)}
            />
            <TextField
                variant="standard"
                label="Post image address (if any)"
                type="url"
                value={props.image[0]}
                onChange={(e) => props.image[1](e.currentTarget.value)}
            />
        </Box>
    )
}
