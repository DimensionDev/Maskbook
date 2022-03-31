import { List } from '@mui/material'
import { makeStyles } from '@masknet/theme'
interface Props {
    open: boolean
    onClose: () => void
}
const useStyles = makeStyles()((theme) => ({}))
export function ApplicationSettingPluginSwitch(props: Props) {
    return <List />
}
