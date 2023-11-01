// Title:BreathingGlow+noise
// reference:　https://www.shadertoy.com/view/ms2fzt

#ifdef GL_ES
precision mediump float;
#endif

#define Use_Perlin
//#define Use_Value
# define PI 3.1415926535897


//Gradient Noise 3D
vec3 hash( vec3 p ) // replace this by something better
{
    p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
              dot(p,vec3(269.5,183.3,246.1)),
              dot(p,vec3(113.5,271.9,124.6)));

    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec3 p )
{
    vec3 i = floor( p );
    vec3 f = fract( p );

    vec3 u = f*f*(3.0-2.0*f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}


vec2 hash2( vec2 x )            //亂數範圍 [-1,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )       //亂數範圍 [-1,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                            dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                         mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                            dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float noise( in vec2 p )        //亂數範圍 [-1,1]
{
#ifdef Use_Perlin    
return gnoise(p);   //gradient noise
#elif defined Use_Value
return vnoise(p);       //value noise
#endif    
return 0.0;
}


float fbm(in vec2 uv)       //亂數範圍 [-1,1]
{
    float f;                                                //fbm - fractal noise (4 octaves)
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    f   = 0.5000*noise( uv ); uv = m*uv;          
    f += 0.2500*noise( uv ); uv = m*uv;
    f += 0.1250*noise( uv ); uv = m*uv;
    f += 0.0625*noise( uv ); uv = m*uv;
    return f;
}

float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}

float flower(float x, float a, float noise){
    // Repeats after interval [0, pi-0.4]. I want it to repeat after [0, pi]
    float freq = (PI-2.0*a)/PI;
    return abs(cos(mod(abs(freq*x),PI-2.0*a)+a)+noise);
}

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    uv= uv*2.0-1.0;
    
    
    //亂數作用雲霧
    float fog= fbm(0.4*uv+vec2(-0.1*u_time, -0.02*u_time))*0.6+0.1;

    float center_dist = length(uv);    
    float flower_theta = atan(uv.y,uv.x);
    float petals = 11.;		// 110.504
    float mult = 1.25;
    float surrounding_strings = 0.0;
    
    for(int i=0; i<3; i++){

        float weight = smoothstep(-0.192, 0.928, center_dist);				// control which area (y-axis value) works with noise
        float freq = 2.288 + float(i)*1.0;								// noise frequency, 像泛音疊加的感覺
        //float noise = gnoise(uv*freq)*0.140*weight*sin(u_time);  
        float noise = noise(vec3(2.180*uv,float(i)+u_time*0.404))*1.592*weight;

        
        float pointy = 0.75*sin(.8*u_time)+.75;
        
        float flowerr = flower(0.5*floor(petals)*flower_theta+(float(i)+1.0)*u_time,pointy, 0.);
        float flowerr2 = flower(0.5*floor(petals)*flower_theta+(float(i)+1.0)*u_time,pointy, noise);
        float p = length(uv)-(.05*sin(u_time)+.15+.10*float(i)+.4*flowerr/flower(0.0,pointy, 0.));
        float d = smoothstep(0.0, 0.03, p);
        
        if(p>=0.2)break;
		petals *= mult;
        
        
        
    

        //動態呼吸
        float breathing=sin(2.0*u_time/5.0*PI)*0.5+0.2;                     //option1
        // float breathing=(exp(sin(u_time/2.0*PI)) - 0.36787944)*0.42545906412;                //option2 正確
        float strength =(0.096*breathing+0.316);          //[0.2~0.3]         //光暈強度加上動態時間營造呼吸感
        //float thickness=(0.1*breathing+0.228);          //[0.1~0.2]         //光環厚度 營造呼吸感
        float thickness=0.1;
        surrounding_strings += glow(flowerr2, strength, thickness)*0.2;
    }
    
    gl_FragColor = vec4((vec3(surrounding_strings)+fog)*vec3(0.478,0.825,1.000),1.0);
}