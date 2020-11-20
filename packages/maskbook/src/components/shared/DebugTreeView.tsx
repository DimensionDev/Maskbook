import { TreeItem, TreeView } from '@material-ui/lab'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

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
