export default '#define GLSLIFY 1\nattribute vec4 a_position;\n\nvarying vec2 v_pos;\n\nvoid main() {\n  gl_Position = a_position;\n  v_pos = a_position.xy;\n}\n'
