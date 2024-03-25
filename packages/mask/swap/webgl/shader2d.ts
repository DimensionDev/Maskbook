// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const vertDefault = `
  attribute vec4 a_position;
  varying vec2 v_pos;

  void main() {
    gl_Position = a_position;
    v_pos = a_position.xy;
  }
`

const fragDefault = `
  precision mediump float;

  uniform float u_time;
  varying vec2 v_pos;

  void main() {
    gl_FragColor = vec4( sin( u_time * 0.001 ) * 0.5 + 0.5, v_pos.x * 0.5 + 0.5, v_pos.y * 0.5 + 0.5, 1.0 );
  }
`

function createShader(gl, type, source) {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader
    } else {
        console.log(`Shader error: Type - ${type} \n --- \n`, gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
    }
}

function createProgram(gl, vert, frag) {
    const program = gl.createProgram()

    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program
    } else {
        console.log('Program error: \n --- \n', gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
    }
}

function setUniform(gl, uniform) {
    const { type, location, value } = uniform

    switch (type) {
        case 'bool':
            gl.uniform1i(location, value === true ? 1 : 0)
            break
        case 'int':
            gl.uniform1i(location, value)
            break
        case 'float':
            gl.uniform1f(location, value)
            break
        case 'vec2':
            gl.uniform2f(location, value.x, value.y)
            break
        case 'vec3':
            gl.uniform3f(location, value.x, value.y, value.z)
            break
        case 'vec4':
            gl.uniform4f(location, value.x, value.y, value.z, value.w)
            break
    }
}

export default class Shader2d {
    constructor(canvas, vertSource = vertDefault, fragSource = fragDefault, uniforms = {}) {
        const gl = canvas.getContext('webgl')
        this.gl = gl

        // Create shaders
        const vertShader = createShader(gl, gl.VERTEX_SHADER, vertSource)
        const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource)

        // Create program
        const program = (this.program = createProgram(gl, vertShader, fragShader))

        // Save position attribute location
        this.positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

        // Setup default uniforms
        this.uniforms = {
            u_time: {
                location: gl.getUniformLocation(program, 'u_time'),
                value: 0,
                type: 'float',
            },
            u_resolution: {
                location: gl.getUniformLocation(program, 'u_resolution'),
                value: { x: 0, y: 0 },
                type: 'vec2',
            },
        }

        // Add extra uniforms
        Object.keys(uniforms).forEach((name) => {
            this.uniforms[name] = Object.assign({}, uniforms[name], {
                location: gl.getUniformLocation(program, name),
            })
        })

        // Create buffer and add full-screen rendering triangle
        this.positionBuffer = gl.createBuffer()

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)

        const positions = [-1, -1, -1, 3, 3, -1]

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

        this.resize()
        this.render()
    }

    resize(width = window.innerWidth, height = window.innerHeight) {
        this.gl.canvas.width = width
        this.gl.canvas.height = height

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

        this.updateUniforms({ u_resolution: { x: width, y: height } })
    }

    updateUniforms(uniforms) {
        Object.keys(uniforms).forEach((name) => {
            this.uniforms[name].value = uniforms[name]
        })
    }

    render(time) {
        const { gl } = this

        // Update time uniform
        this.updateUniforms({ u_time: 30000 + time })

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program)

        // Bind the position attribute
        gl.enableVertexAttribArray(this.positionAttributeLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
        gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

        // Update uniforms
        Object.keys(this.uniforms).forEach((name) => {
            const uniform = this.uniforms[name]
            setUniform(gl, uniform)
        })

        // Draw
        const primitiveType = gl.TRIANGLES
        const pointOffset = 0
        const pointCount = 3
        gl.drawArrays(primitiveType, pointOffset, pointCount)
    }
}
