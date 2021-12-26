import { TreeItem, TreeView } from '@mui/lab'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export type DebugTreeViewProps = {
    id: string
    name: string
    children: DebugTreeViewProps[]
}

export function DebugTreeView(props: DebugTreeViewProps) {
    const renderTree = (nodes: DebugTreeViewProps) => (
        <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    )

    return (
        <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpanded={['root']}
            defaultExpandIcon={<ChevronRightIcon />}>
            {renderTree(props)}
        </TreeView>
    )
}
