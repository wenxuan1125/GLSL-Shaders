#ifdef GL_ES
precision mediump float;
#endif


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;           // moon -> video
// uniform sampler2D u_tex1;           // video


uniform float h;
uniform float noiseScale;
uniform vec3 catColor; 
uniform vec3 brightBackgroundColor; 
uniform vec3 darkBackgroundColor;
uniform vec3 holeColor; 

vec4 timelapseAverage(sampler2D src_c_img, sampler2D src_p_img, vec2 uv, float weight)
{
	vec4 A=texture2D(src_c_img, uv);
	vec4 B=texture2D(src_p_img, uv);
	return mix(A, B, weight);
}

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

//hatching
float texh(in vec2 p, in float str)
{
    float rz= 1.0;
    int j=20;
    for (int i=0;i<20;i++){
        float pas=float(i)/float(j);
        float g = gnoise(vec2(1., 80.)*p); //亂數範圍 [0,1]
        g=smoothstep(0.05, 0.3, g);
        p.xy = p.yx;
        p += 0.07;
        p*= 1.2;
        rz = min(1.-g,rz);
        if ( 1.0-pas < str) break;     
    }
    return rz;
}


float mouseEffect(vec2 uv, vec2 mouse, float size)
{
    float breathing=(exp(sin(u_time*2.0*3.14159/8.0)) - 0.36787944)*0.42545906412;
    float dist=length(uv-mouse);
    return smoothstep(size, size+0.2*(breathing+0.5), dist);  //size
}

void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;				//screen coordinate
    //vec3 color = texture2D(u_tex1, st).rgb;
    //vec3 luma= vec3(0.21*color.r + 0.72*color.g + 0.07*color.b);  //perceptually relevant
    //vec3 fbo = texture2D(u_buffer0, st).rgb;
    
    // float blur= 0.999-(u_mouse.x/u_resolution.x)*0.199;
    // gl_FragColor = timelapseAverage(u_tex1, u_buffer0, st, blur);


    

    vec4 pixel_color = texture2D(u_tex0, uv);
    vec3 gray_color0 = vec3(grayScale(pixel_color.rgb));

    // float h = 5.0;

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

    vec4 shaderColor;

    if(line > 0.5){
        // vec3(1.0, 0.5647, 0.5098)
        shaderColor = vec4(vec3(line)*catColor + 0.9* pixel_color.rgb, 1.0);
    }
    else{
        // vec3(0.6706, 0.6549, 0.6431)
        // vec3(0.1373, 0.0392, 0.0)
        vec4 color1 = vec4(brightBackgroundColor, 1.0);
        vec4 color2 = vec4(darkBackgroundColor, 1.0);
        vec4 a = vec4(vec3(gnoise(noiseScale*uv-100.)), 1.0);
        shaderColor = 1.*mix(color1, color2, a.x);
    }

    // vec2 mouse=u_mouse.xy/u_resolution.xy;
    // float value=mouseEffect(uv,mouse,0.2);

    // vec4 inkColor = vec4(0.9647, 0.9216, 0.8745, 1.0);
    //vec4 src = mix( mix( inkColor, vec4(1.), c.r ), c, .5 );
    // vec4 mixColor = mix(shaderColor, vec4(holeColor, 1.0), value);
    gl_FragColor = shaderColor;    


}



