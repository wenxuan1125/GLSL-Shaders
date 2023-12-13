// vedio link: https://youtu.be/cwFzY49meP0?si=RtI4YO4tU2pnImuo
// reference: https://www.shadertoy.com/view/td2yDm



#ifdef GL_ES
precision mediump float;
#endif


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;           // moon -> video
// uniform sampler2D u_tex1;           // video


float grayScale(vec3 pixel) { return pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114; }


vec2 hash2( vec2 x )           //亂數範圍 [0,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )       //亂數範圍 [0,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );   
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}


void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;				//screen coordinate

    vec4 pixel_color = texture2D(u_tex0, uv);
    vec3 gray_color0 = vec3(grayScale(pixel_color.rgb));

    float h = 5.0;

    vec4 o = texture2D(u_tex0, (gl_FragCoord.xy + vec2( 0, 0))/u_resolution.xy);
	vec4 n = texture2D(u_tex0, (gl_FragCoord.xy + vec2( 0, h))/u_resolution.xy);
    vec4 e = texture2D(u_tex0, (gl_FragCoord.xy + vec2( h, 0))/u_resolution.xy);
    vec4 s = texture2D(u_tex0, (gl_FragCoord.xy + vec2( 0,-h))/u_resolution.xy);
    vec4 w = texture2D(u_tex0, (gl_FragCoord.xy + vec2(-h, 0))/u_resolution.xy);
    
    vec4 dy = (n - s)*.5;
    vec4 dx = (e - w)*.5;
    
    vec4 edge = sqrt(dx*dx + dy*dy);
    vec4 angle = atan(dy, dx);

    vec3 gray_color = vec3(grayScale(vec3(edge.rgb * 10.0)));

    float line = smoothstep(0.298, 0.3, gray_color.g);

    if(line > 0.5)
        gl_FragColor = vec4(vec3(line)*(vec3(1.0, 0.5647, 0.5098)) + 0.9* pixel_color.rgb, 1.0);
    else{
        vec4 color1 = vec4(vec3(0.6706, 0.6549, 0.6431), 1.0);
        vec4 color2 = vec4(vec3(0.1373, 0.0392, 0.0), 1.0);
        vec4 a = vec4(vec3(gnoise(500.*uv-100.)), 1.0);
        gl_FragColor = 1.*mix(color1, color2, a.x);
    }
        
}


