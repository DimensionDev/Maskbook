import { useValueRef } from '@masknet/shared'
import { debugModeSetting } from '../../../settings/settings'
import { Box, FormControl, TextField, InputLabel, MenuItem, Select } from '@material-ui/core'
import { CurrentSNSNetwork } from '@masknet/plugin-infra'
export interface MockProps {
    network: CurrentSNSNetwork
    onNetworkChange: (val: CurrentSNSNetwork) => void
    author: string
    onAuthorChanged: (newVal: string) => void
    id: string
    onIdChanged: (newVal: string) => void
    content: string
    onContentChanged: (newVal: string) => void
    image: string
    onImageChanged: (newVal: string) => void
    currentIdentity: string
    onCurrentIdentityChanged: (newVal: string) => void
    mentionedLink: string
    onMentionedLinkChanged: (newVal: string) => void
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
                <Select
                    variant="standard"
                    sx={{ minWidth: 250 }}
                    value={props.network}
                    onChange={(e) => props.onNetworkChange(e.target.value as CurrentSNSNetwork)}>
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
                value={props.id}
                onChange={(e) => props.onIdChanged(e.currentTarget.value)}
            />
            <TextField
                variant="standard"
                label="Post Author"
                value={props.author}
                onChange={(e) => props.onAuthorChanged(e.currentTarget.value)}
            />
            <TextField
                variant="standard"
                label="Post content"
                multiline
                value={props.content}
                onChange={(e) => props.onContentChanged(e.currentTarget.value)}
            />
            <TextField
                variant="standard"
                label="Post image address (if any)"
                type="url"
                value={props.image}
                onChange={(e) => props.onImageChanged(e.currentTarget.value)}
            />
            <TextField
                variant="standard"
                label="Current identity"
                value={props.currentIdentity}
                onChange={(e) => props.onCurrentIdentityChanged(e.currentTarget.value)}
            />
            <TextField
                variant="standard"
                type="url"
                label="Mentioned Links"
                value={props.mentionedLink}
                onChange={(e) => props.onMentionedLinkChanged(e.currentTarget.value)}
            />
        </Box>
    )
}
