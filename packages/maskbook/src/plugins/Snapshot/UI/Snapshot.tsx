import { Typography } from '@material-ui/core'
import { SnapshotState } from '../hooks/useSnapshotState'

export interface SnapshotProps {}

export function Snapshot(props: SnapshotProps) {
    const { identifier } = SnapshotState.useContainer()
    return <Typography>{identifier?.space}</Typography>
}
