import { Suspense, useEffect, useRef, useState, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, Environment, Html, ContactShadows } from '@react-three/drei'

// ── 3D Model loader ───────────────────────────────────────
function YogaModel() {
  const group  = useRef()
  const { scene, animations } = useGLTF('/models/yoga.glb')
  const { actions, names }    = useAnimations(animations, group)

  useEffect(() => {
    if (names.length > 0) {
      actions[names[0]]?.reset().fadeIn(0.5).play()
    }
    return () => Object.values(actions).forEach((a) => a?.fadeOut(0.5))
  }, [actions, names])

  return (
    <primitive
      ref={group}
      object={scene}
      scale={1.9}
      position={[0, -1.85, 0]}
      rotation={[0, 0.25, 0]}
    />
  )
}

// ── Loading spinner shown while model downloads ───────────
function Spinner() {
  return (
    <Html center>
      <div style={{ textAlign: 'center', color: 'rgba(134,239,172,0.9)' }}>
        <div style={{
          width: 36, height: 36, margin: '0 auto 8px',
          border: '3px solid rgba(134,239,172,0.25)',
          borderTopColor: 'rgba(134,239,172,0.9)',
          borderRadius: '50%',
          animation: 'spin3d 1s linear infinite',
        }} />
        <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Loading…</span>
        <style>{`@keyframes spin3d { to { transform: rotate(360deg) } }`}</style>
      </div>
    </Html>
  )
}

// ── Error boundary — falls back to SVG if model missing ───
class ModelErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <FallbackSVG />
    return this.props.children
  }
}

// ── 3D Scene ──────────────────────────────────────────────
function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 3.8], fov: 44 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.55} color="#d4f7e7" />
      <directionalLight position={[4, 6, 3]}  intensity={1.3} color="#ffffff" castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#a7f3d0" />
      <pointLight       position={[0, 4, 2]}   intensity={0.6} color="#34d399" />

      <Suspense fallback={<Spinner />}>
        <ModelErrorBoundary>
          <YogaModel />
        </ModelErrorBoundary>

        {/* Ground shadow */}
        <ContactShadows
          position={[0, -1.85, 0]}
          opacity={0.35}
          scale={4}
          blur={2}
          far={3}
          color="#10b981"
        />

        {/* Environment lighting — soft forest/nature tone */}
        <Environment preset="forest" />
      </Suspense>

      {/* Allow user to rotate model by dragging */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  )
}

// ── SVG fallback (shows if /models/yoga.glb not found) ────
const UA  = ({x1,y1,x2,y2}) => (<><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(34,170,110,0.55)" strokeWidth={28} strokeLinecap="round"/><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.94)" strokeWidth={21} strokeLinecap="round"/></>)
const FA  = ({x1,y1,x2,y2}) => (<><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(34,170,110,0.5)"  strokeWidth={22} strokeLinecap="round"/><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.92)" strokeWidth={16} strokeLinecap="round"/></>)
const TH  = ({x1,y1,x2,y2}) => (<><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(34,170,110,0.55)" strokeWidth={36} strokeLinecap="round"/><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.94)" strokeWidth={29} strokeLinecap="round"/></>)
const CA  = ({x1,y1,x2,y2}) => (<><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(34,170,110,0.5)"  strokeWidth={26} strokeLinecap="round"/><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.92)" strokeWidth={20} strokeLinecap="round"/></>)
const UAC = ({d}) => (<><path d={d} stroke="rgba(34,170,110,0.55)" strokeWidth={28} strokeLinecap="round" fill="none"/><path d={d} stroke="rgba(255,255,255,0.94)" strokeWidth={21} strokeLinecap="round" fill="none"/></>)
const Jt  = ({cx,cy,r=12}) => (<circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.9)" stroke="rgba(34,170,110,0.5)" strokeWidth={3}/>)
const Hd  = ({cx,cy}) => (<><circle cx={cx} cy={cy} r={25} fill="rgba(255,255,255,0.96)"/><path d={`M${cx-13},${cy-5} Q${cx-8},${cy+1} ${cx-3},${cy-5}`} stroke="rgba(16,90,50,0.5)" strokeWidth="2.2" strokeLinecap="round" fill="none"/><path d={`M${cx+3},${cy-5} Q${cx+8},${cy+1} ${cx+13},${cy-5}`} stroke="rgba(16,90,50,0.5)" strokeWidth="2.2" strokeLinecap="round" fill="none"/><path d={`M${cx-9},${cy+9} Q${cx},${cy+16} ${cx+9},${cy+9}`} stroke="rgba(16,90,50,0.35)" strokeWidth="2" strokeLinecap="round" fill="none"/></>)
const NK  = ({cx,y}) => (<><line x1={cx} y1={y} x2={cx} y2={y+18} stroke="rgba(34,170,110,0.45)" strokeWidth={20} strokeLinecap="round"/><line x1={cx} y1={y} x2={cx} y2={y+18} stroke="rgba(255,255,255,0.9)" strokeWidth={14} strokeLinecap="round"/></>)
const TR  = ({d}) => (<path d={d} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinejoin="round"/>)

const POSES = [
  { name:'Tadasana',       label:'Mountain Pose',  figure:(<g><Hd cx={100} cy={25}/><NK cx={100} y={50}/><TR d="M33,72 C28,100 40,162 58,176 L142,176 C160,162 172,100 167,72 Q135,60 100,58 Q65,60 33,72 Z"/><Jt cx={34} cy={78} r={15}/><Jt cx={166} cy={78} r={15}/><UA x1={34} y1={84} x2={18} y2={162}/><Jt cx={18} cy={162} r={11}/><FA x1={18} y1={162} x2={12} y2={222}/><UA x1={166} y1={84} x2={182} y2={162}/><Jt cx={182} cy={162} r={11}/><FA x1={182} y1={162} x2={188} y2={222}/><TH x1={72} y1={176} x2={63} y2={258}/><Jt cx={63} cy={258} r={13}/><CA x1={63} y1={258} x2={58} y2={318}/><TH x1={128} y1={176} x2={137} y2={258}/><Jt cx={137} cy={258} r={13}/><CA x1={137} y1={258} x2={142} y2={318}/></g>) },
  { name:'Vrikshasana',    label:'Tree Pose',       figure:(<g><Hd cx={100} cy={22}/><NK cx={100} y={47}/><TR d="M36,70 C30,98 42,158 60,172 L140,172 C158,158 170,98 164,70 Q135,58 100,56 Q65,58 36,70 Z"/><Jt cx={36} cy={76} r={15}/><Jt cx={164} cy={76} r={15}/><UAC d="M36,80 C28,55 55,22 82,8"/><UAC d="M164,80 C172,55 145,22 118,8"/><circle cx="100" cy="6" r="13" fill="rgba(255,255,255,0.85)" stroke="rgba(34,170,110,0.45)" strokeWidth="2"/><TH x1={108} y1={172} x2={108} y2={258}/><Jt cx={108} cy={258} r={13}/><CA x1={108} y1={258} x2={108} y2={318}/><UAC d="M88,182 C98,190 122,198 128,222"/><Jt cx={128} cy={222} r={12}/></g>) },
  { name:'Virabhadrasana', label:'Warrior Pose',    figure:(<g><Hd cx={70} cy={18}/><NK cx={70} y={43}/><TR d="M22,68 C18,96 32,158 50,172 L90,172 C108,158 122,96 118,68 Q94,56 70,54 Q46,56 22,68 Z"/><Jt cx={22} cy={74} r={15}/><Jt cx={118} cy={74} r={15}/><UA x1={22} y1={80} x2={2} y2={90}/><FA x1={2} y1={90} x2={-8} y2={100}/><UA x1={118} y1={78} x2={175} y2={68}/><FA x1={175} y1={68} x2={200} y2={60}/><TH x1={55} y1={172} x2={28} y2={248}/><Jt cx={28} cy={248} r={13}/><CA x1={28} y1={248} x2={12} y2={318}/><TH x1={85} y1={172} x2={138} y2={258}/><Jt cx={138} cy={258} r={13}/><CA x1={138} y1={258} x2={162} y2={318}/></g>) },
  { name:'Trikonasana',    label:'Triangle Pose',   figure:(<g><Hd cx={36} cy={72}/><NK cx={36} y={97}/><TR d="M10,108 C8,128 20,162 40,178 L80,178 C100,162 112,128 110,108 Q75,95 60,100 Q38,100 10,108 Z"/><Jt cx={12} cy={115} r={14}/><Jt cx={110} cy={110} r={14}/><UA x1={14} y1={120} x2={10} y2={195}/><FA x1={10} y1={195} x2={8} y2={258}/><UA x1={108} y1={112} x2={130} y2={48}/><FA x1={130} y1={48} x2={148} y2={-5}/><TH x1={50} y1={178} x2={28} y2={248}/><Jt cx={28} cy={248} r={13}/><CA x1={28} y1={248} x2={12} y2={318}/><TH x1={70} y1={178} x2={140} y2={248}/><Jt cx={140} cy={248} r={13}/><CA x1={140} y1={258} x2={172} y2={318}/></g>) },
]

function FallbackSVG() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible]  = useState(true)
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setCurrent((p) => (p+1) % POSES.length); setVisible(true) }, 500)
    }, 3200)
    return () => clearInterval(id)
  }, [])
  const pose = POSES[current]
  return (
    <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div style={{ opacity:visible?1:0, transition:'opacity 0.5s ease-in-out', filter:'drop-shadow(0 0 16px rgba(52,211,153,0.4))' }}>
        <svg viewBox="0 0 200 320" width="230" height="290" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
          {pose.figure}
        </svg>
      </div>
      <div style={{ opacity:visible?1:0, transition:'opacity 0.5s ease-in-out' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:2 }}>
          <div style={{ height:1, width:28, background:'rgba(134,239,172,0.45)' }} />
          <span style={{ color:'rgba(255,255,255,0.9)', fontSize:13, fontWeight:700, letterSpacing:1 }}>{pose.name}</span>
          <div style={{ height:1, width:28, background:'rgba(134,239,172,0.45)' }} />
        </div>
        <span style={{ color:'rgba(134,239,172,0.7)', fontSize:10, letterSpacing:3, textTransform:'uppercase' }}>{pose.label}</span>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────
export default function YogaAnimation() {
  const [has3D, setHas3D] = useState(null)   // null=checking, true/false

  // Check if the model file exists before mounting Canvas
  useEffect(() => {
    fetch('/models/yoga.glb', { method: 'HEAD' })
      .then((r) => setHas3D(r.ok))
      .catch(() => setHas3D(false))
  }, [])

  const particles = [
    {x:22,y:50,s:5,delay:'0s',dur:'4s'},{x:355,y:40,s:4,delay:'1s',dur:'5s'},
    {x:8,y:210,s:6,delay:'2s',dur:'6s'},{x:372,y:200,s:4,delay:'0.5s',dur:'4.5s'},
    {x:45,y:365,s:5,delay:'1.5s',dur:'5.5s'},{x:335,y:360,s:6,delay:'3s',dur:'5s'},
    {x:192,y:6,s:4,delay:'2.5s',dur:'4s'},
  ]

  return (
    <div style={{ position:'relative', width:420, height:470, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`
        @keyframes yring { 0%,100%{opacity:.12;transform:scale(.97)} 50%{opacity:.38;transform:scale(1.04)} }
        @keyframes ypart { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-14px);opacity:.85} }
        @keyframes yglow { 0%,100%{opacity:.2} 50%{opacity:.5} }
      `}</style>

      {/* Pulsing rings */}
      {[390,315,240].map((sz,i) => (
        <div key={sz} style={{ position:'absolute', width:sz, height:sz, borderRadius:'50%', border:`1px solid rgba(134,239,172,${0.18+i*0.1})`, animation:`yring 5s ease-in-out infinite ${i*1.5}s` }} />
      ))}

      {/* Glow */}
      <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(52,211,153,0.18) 0%,transparent 70%)', animation:'yglow 4s ease-in-out infinite' }} />

      {/* OM symbol */}
      <div style={{ position:'absolute', fontSize:130, color:'rgba(255,255,255,0.04)', fontFamily:'Georgia,serif', top:'50%', left:'50%', transform:'translate(-50%,-55%)', lineHeight:1, userSelect:'none', pointerEvents:'none' }}>ॐ</div>

      {/* Content */}
      <div style={{ position:'relative', zIndex:10, width:420, height:420 }}>
        {has3D === null && (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:36, height:36, border:'3px solid rgba(134,239,172,0.25)', borderTopColor:'rgba(134,239,172,0.9)', borderRadius:'50%', animation:'spin3d 1s linear infinite' }} />
            <style>{`@keyframes spin3d{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {has3D === true && (
          <Scene3D />
        )}

        {has3D === false && (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FallbackSVG />
          </div>
        )}
      </div>

      {/* Yoga mat */}
      <div style={{ position:'absolute', bottom:48, left:'50%', transform:'translateX(-50%)', width:200, height:14, borderRadius:7, background:'rgba(52,211,153,0.2)', border:'1px solid rgba(52,211,153,0.35)' }} />

      {/* Floating particles */}
      {particles.map((p,i) => (
        <div key={i} style={{ position:'absolute', width:p.s, height:p.s, borderRadius:'50%', background:'rgba(134,239,172,0.6)', left:p.x, top:p.y, animation:`ypart ${p.dur} ease-in-out infinite ${p.delay}` }} />
      ))}
    </div>
  )
}
