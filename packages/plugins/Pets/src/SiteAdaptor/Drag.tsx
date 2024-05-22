import { PureComponent, type PropsWithChildren, type MouseEvent as ReactMouseEvent, createRef } from 'react'

interface StateProps {
    pos: {
        x: number
        y: number
    }
    dragging: boolean
    rel: any
}

const contentWidth = 150
const contentHeight = 150
const startPosition = {
    x: 50,
    y: 150,
}

interface DraggableProps {
    baseWidth?: number
    baseHeight?: number
    moveHandle?: (x: number, y: number) => void
}

// TODO: rewrite to function components
// TODO: use library like react-dnd instead.
// eslint-disable-next-line @masknet/jsx-no-class-component, react/no-class-component
class Draggable extends PureComponent<PropsWithChildren<DraggableProps>> {
    ref = createRef<HTMLDivElement>()
    mouseMoveFuc = this.onMouseMove.bind(this)
    mouseUpFuc = this.onMouseUp.bind(this)

    static defaultProps = {
        transferMsg: (x: number, y: number) => {},
    }

    override state: StateProps = {
        pos: {
            x: startPosition.x,
            y: startPosition.y,
        },
        dragging: false,
        rel: null,
    }

    onMouseDown(e: MouseEvent | ReactMouseEvent) {
        if (e.button !== 0) return
        if (!this.ref.current) return
        const divDom = this.ref.current
        const left = divDom.offsetLeft
        const top = divDom.offsetTop
        this.setState({
            dragging: true,
            rel: {
                x: e.pageX - left,
                y: e.pageY - top,
            },
        })
        e.stopPropagation()
        e.preventDefault()
    }

    onMouseUp(e: MouseEvent) {
        this.setState({ dragging: false })
        e.stopPropagation()
        e.preventDefault()
    }

    onMouseMove(e: MouseEvent) {
        if (!this.state.dragging) return
        this.setState({
            pos: {
                x: window.innerWidth - (this.props.baseWidth || contentWidth) - (e.pageX - this.state.rel.x),
                y: window.innerHeight - (this.props.baseHeight || contentHeight) - (e.pageY - this.state.rel.y),
            },
        })
        if (this.props.moveHandle) {
            this.props.moveHandle(this.state.pos.x, this.state.pos.y)
        }
        e.stopPropagation()
        e.preventDefault()
    }

    override componentDidUpdate(_props: any, state: StateProps) {
        if (this.state.dragging && !state.dragging) {
            document.addEventListener('mousemove', this.mouseMoveFuc)
            document.addEventListener('mouseup', this.mouseUpFuc)
        } else if (!this.state.dragging && state.dragging) {
            document.removeEventListener('mousemove', this.mouseMoveFuc)
            document.removeEventListener('mouseup', this.mouseUpFuc)
        }
    }
    override componentWillUnmount() {
        document.removeEventListener('mousemove', this.mouseMoveFuc)
        document.removeEventListener('mouseup', this.mouseUpFuc)
    }
    override render() {
        return (
            <div
                ref={this.ref}
                onMouseDown={this.onMouseDown.bind(this)}
                style={{
                    position: 'fixed',
                    right: this.state.pos.x,
                    bottom: this.state.pos.y,
                    width: this.props.baseWidth || contentWidth,
                    height: this.props.baseHeight || contentHeight,
                }}>
                {this.props.children || null}
            </div>
        )
    }
}

export default Draggable
