import { useActivatedPluginsSNSAdaptor, Plugin } from '@masknet/plugin-infra'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { makeStyles } from '@masknet/theme'
import { useRef, useState } from 'react'
interface Props {}

const useStyles = makeStyles()((theme) => ({
    droppable: {
        width: '100%',
        height: 400,
        background: '#eee',
    },
}))

export function DraggerDemo() {
    const { classes } = useStyles()

    return (
        <div>
            <DndProvider backend={HTML5Backend}>
                <AppList />
            </DndProvider>
        </div>
    )
}

interface Application {
    entry: Plugin.SNSAdaptor.ApplicationEntry
    pluginId: string
}

function AppList() {
    const { classes } = useStyles()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')

    const applicationList = snsAdaptorPlugins.reduce<Application[]>((acc, cur) => {
        if (!cur.ApplicationEntries) return acc
        return acc.concat(
            cur.ApplicationEntries.filter((x) => x.appBoardSortingDefaultPriority).map((x) => {
                return {
                    entry: x,
                    pluginId: cur.ID,
                }
            }) ?? [],
        )
    }, [])
    const [items, setItems] = useState(Array.from({ length: 10 }))

    const moveCardHandler = (dragIndex: number, hoverIndex: number) => {
        const dragItem = items[dragIndex]

        if (dragItem) {
            setItems((prevState) => {
                const copyStateArray = [...prevState]

                // remove item by "hoverIndex" and put "dragItem" instead
                const prevItem = copyStateArray.splice(hoverIndex, 1, dragItem)

                // remove item by "dragIndex" and put "prevItem" instead
                copyStateArray.splice(dragIndex, 1, prevItem[0])

                return copyStateArray
            })
        }
    }

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'app',
        drop: () => {},
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    })

    const getBackgroundColor = () => {
        if (isOver) {
            if (canDrop) {
                return 'rgb(188,251,255)'
            } else if (!canDrop) {
                return 'rgb(255,188,188)'
            }
            return ''
        } else {
            return ''
        }
    }

    const ref = useRef<HTMLDivElement>(null)

    drop(ref)
    return (
        <div style={{ backgroundColor: getBackgroundColor() }} ref={ref}>
            {items.map((x, i) => (
                <div key={i}>
                    <DraggableItem index={i} moveCardHandler={moveCardHandler} />
                </div>
            ))}
        </div>
    )
}

interface DraggableItemProps {
    moveCardHandler: (dragIndex: number, hoverIndex: number) => void
    index: number
}

function DraggableItem(props: DraggableItemProps) {
    const { index, moveCardHandler } = props

    const ref = useRef<HTMLDivElement>(null)

    const [, drop] = useDrop<{ index: number }>({
        accept: 'app',
        hover(item, monitor) {
            console.log('hover')
            if (!ref.current) {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect()
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()

            if (!clientOffset) return
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
            // Time to actually perform the action

            moveCardHandler(dragIndex, hoverIndex)

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        },
    })

    const [{ isDragging }, drag] = useDrag({
        item: { index, name: 'ddd', type: 'app' },
        end: (item, monitor) => {},
        collect: (monitor) => {
            return {
                isDragging: monitor.isDragging(),
            }
        },
        type: 'app',
    })

    drag(drop(ref))

    return <div ref={ref}>{index}</div>
}
