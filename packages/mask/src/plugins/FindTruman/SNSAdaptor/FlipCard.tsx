import React, { useEffect, useState } from 'react'

enum FlipCardChildType {
    FRONT = 0,
    BACK = 1,
}
const FlipCardRotateDegree = {
    noFlipped: 0,
    frontRotate: 180,
    backRotate: -180,
}

interface ReactFlipCardProps {
    cardZIndex?: string
    containerStyle?: {}
    isFlipped?: boolean
    flipSpeedBackToFront?: number
    flipSpeedFrontToBack?: number
    cardStyles?: { front?: {}; back?: {} }
    infinite?: boolean
    flipDirection?: 'horizontal' | 'vertical'
    children: [React.ReactNode, React.ReactNode]
}
const FlipCard: React.FC<ReactFlipCardProps> = (props) => {
    const {
        cardStyles,
        cardZIndex,
        containerStyle,
        flipDirection,
        flipSpeedFrontToBack,
        flipSpeedBackToFront,
        infinite,
    } = props

    const [isFlipped, setFlipped] = useState(props.isFlipped)
    const [rotation, setRotation] = useState(FlipCardRotateDegree.noFlipped)

    useEffect(() => {
        if (props.isFlipped !== isFlipped) {
            setFlipped(props.isFlipped)
            setRotation((c) => c + FlipCardRotateDegree.frontRotate)
        }
    }, [props.isFlipped])

    const getComponent = (key: FlipCardChildType) => {
        return props.children[key]
    }

    const frontRotateY = `rotateY(${
        infinite ? rotation : isFlipped ? FlipCardRotateDegree.frontRotate : FlipCardRotateDegree.noFlipped
    }deg)`
    const backRotateY = `rotateY(${
        infinite
            ? rotation + FlipCardRotateDegree.frontRotate
            : isFlipped
            ? FlipCardRotateDegree.noFlipped
            : FlipCardRotateDegree.backRotate
    }deg)`
    const frontRotateX = `rotateX(${
        infinite ? rotation : isFlipped ? FlipCardRotateDegree.frontRotate : FlipCardRotateDegree.noFlipped
    }deg)`
    const backRotateX = `rotateX(${
        infinite
            ? rotation + FlipCardRotateDegree.frontRotate
            : isFlipped
            ? FlipCardRotateDegree.noFlipped
            : FlipCardRotateDegree.backRotate
    }deg)`

    const styles: any = {
        back: {
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            height: '100%',
            left: '0',
            position: isFlipped ? 'relative' : 'absolute',
            top: '0',
            transform: flipDirection === 'horizontal' ? backRotateY : backRotateX,
            transformStyle: 'preserve-3d',
            transition: `${flipSpeedFrontToBack}s`,
            width: '100%',
            ...cardStyles?.back,
        },
        container: {
            perspective: '1000px',
            zIndex: `${cardZIndex}`,
        },
        flipper: {
            height: '100%',
            position: 'relative',
            width: '100%',
        },
        front: {
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            height: '100%',
            left: '0',
            position: isFlipped ? 'absolute' : 'relative',
            top: '0',
            transform: flipDirection === 'horizontal' ? frontRotateY : frontRotateX,
            transformStyle: 'preserve-3d',
            transition: `${flipSpeedBackToFront}s`,
            width: '100%',
            zIndex: '2',
            ...cardStyles?.front,
        },
    }

    return (
        <div style={{ ...styles.container, ...containerStyle }}>
            <div style={styles.flipper}>
                <div style={styles.front}>{getComponent(FlipCardChildType.FRONT)}</div>
                <div style={styles.back}>{getComponent(FlipCardChildType.BACK)}</div>
            </div>
        </div>
    )
}

FlipCard.defaultProps = {
    cardStyles: {
        back: {},
        front: {},
    },
    cardZIndex: 'auto',
    containerStyle: {},
    flipDirection: 'horizontal',
    flipSpeedBackToFront: 0.6,
    flipSpeedFrontToBack: 0.6,
    infinite: false,
    isFlipped: false,
}

export default FlipCard
