import React from 'react'

interface StateProps {
    pos: {
        x: number
        y: number
    }
    dragging: boolean
    rel: any
}

const contentWidth = 128
const contentHeight = 200
class Draggable extends React.PureComponent {
    ref = React.createRef()
    mouseMoveFuc = this.onMouseMove.bind(this)
    mouseUpFuc = this.onMouseUp.bind(this)

    override state: StateProps = {
        pos: {
            x: window.innerWidth - contentWidth - 50,
            y: window.innerHeight - contentHeight - 200,
        },
        dragging: false,
        rel: null,
    }

    onMouseDown(e: React.MouseEvent) {
        if (e.button !== 0) return
        if (!this.ref || !this.ref.current) return
        const divDom: HTMLDivElement = this.ref.current as HTMLDivElement
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
                x: e.pageX - this.state.rel.x,
                y: e.pageY - this.state.rel.y,
            },
        })
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
                //@ts-ignore
                ref={this.ref}
                onMouseDown={this.onMouseDown.bind(this)}
                style={{
                    position: 'absolute',
                    left: this.state.pos.x,
                    top: this.state.pos.y,
                    width: contentWidth,
                    height: contentHeight,
                }}>
                {this.props.children || null}
            </div>
        )
    }
}

export default Draggable
