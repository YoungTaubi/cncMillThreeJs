import { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import useSound from 'use-sound';
import './App.css'

function App() {

  const [axisPosition, setAxisPosition] = useState({
    x: 0,
    y: 0,
    z: 0
  })

  const [spindelRunning, setSpindelrunning] = useState(false)

  const intervalRef = useRef(null);
  const axisIntervalRef = {
    x: useRef(null),
    y: useRef(null),
    z: useRef(null)
  }
  

  const maxTravel = {
    x: .48,
    y: 0.85,
    z: 0.1
  }

  const minTravel = {
    x: -0.48,
    y: -0.79,
    z: -.05
  }

  const [play, { stop }] = useSound('../src/assets/machine_1.wav', {
    sprite: {
      axisMoving: [0, 100],
      spindle: [1050, 1100],
    },
    volume: 1,
    loop: true
  });


  const moveAxis = (axis, direction) => {
    play({ id: 'axisMoving' })
    const maxVelocity = 0.01
    const acceleration = 0.00001
    let velocity = 0
    if (direction === 'forward' && axisPosition[axis] < maxTravel[axis]) {
      axisIntervalRef[axis].current = setInterval(() => {
        if (velocity < maxVelocity) {
          velocity += acceleration
        }
        setAxisPosition(prevPos =>
          ({ ...prevPos, [axis]: prevPos[axis] + velocity }))
      }, 1)
    }

    if (direction === 'backward' && axisPosition[axis] > minTravel[axis]) {
      axisIntervalRef[axis].current = setInterval(() => {
        if (velocity < maxVelocity) {
          velocity += acceleration
        }
        setAxisPosition(prevPos =>
          ({ ...prevPos, [axis]: prevPos[axis] - velocity }))
      }, 1)
    }
  }

  const stopAxis = (axis, direction) => {
    console.log('stop');
    
    clearInterval(axisIntervalRef[axis].current);
    axisIntervalRef[axis].current = null;
    if (direction === 'forward') {
      setAxisPosition(prevPos => ({ ...prevPos, [axis]: maxTravel[axis] }))
    }
    if (direction === 'backward') {
      setAxisPosition(prevPos => ({ ...prevPos, [axis]: minTravel[axis] }))
    }
    console.log(axisIntervalRef.x, axisIntervalRef.y, axisIntervalRef.z);
    if (!axisIntervalRef.x.current && !axisIntervalRef.y.current && !axisIntervalRef.z.current) {
      stop()
    }
    
  }
 
  const homeMaschin = () => {
    moveAxis('z', 'forward')
    moveAxis('x', 'backward')
    moveAxis('y', 'forward')
  }

  if (axisPosition.y > maxTravel.y) {
    stopAxis('y', 'forward')
  }
  if (axisPosition.y < minTravel.y) {
    stopAxis('y', 'backward')
  }
  if (axisPosition.x > maxTravel.x) {
    stopAxis('x', 'forward')
  }
  if (axisPosition.x < minTravel.x) {
    stopAxis('x', 'backward')
  }
  if (axisPosition.z > maxTravel.z) {
    stopAxis('z', 'forward')
  }
  if (axisPosition.z < minTravel.z) {
    stopAxis('z', 'backward')
  }

  function CNCMillGantry({ ...props }) {
    const group = useRef()
    const { nodes, materials } = useGLTF('/CNCMillCompressed.glb')

    return (
      <group ref={group} {...props} dispose={null} scale={.01} position={[0, -.7, axisPosition.y]}>
        <mesh receiveShadow castShadow geometry={nodes.PortalMuttern.geometry} material={materials.AnodizedSilver} />
        <mesh receiveShadow castShadow geometry={nodes.portalSpindel.geometry} material={materials.PolishedMetal} position={[-9.44, 126.72, -11.2]} rotation={[axisPosition.x * 60, 0, 0]} />
        <mesh receiveShadow castShadow geometry={nodes.portaWagen.geometry} material={materials.BlackMatte} position={[0, 0, 0]} />
        <mesh receiveShadow castShadow geometry={nodes.portalWangen.geometry} material={materials.AnodizedBlue} />
        <mesh receiveShadow castShadow geometry={nodes.portalSchienen.geometry} material={materials.PolishedMetal} />
        <mesh receiveShadow castShadow geometry={nodes.portalBalken.geometry} material={materials.AnodizedBlue} />
        <mesh receiveShadow castShadow geometry={nodes.portalSchrauben.geometry} material={materials.PolishedMetal} />
      </group>
    )
  }

  function CNCMillTable({ ...props }) {
    const group = useRef()
    const tableSpindleRight = useRef()
    const { nodes, materials } = useGLTF('/CNCMillCompressed.glb')

    return (
      <>
        <group ref={group} {...props} dispose={null} scale={.01} position={[0, -.7, 0]}>
          <mesh receiveShadow castShadow geometry={nodes.tischSchienen.geometry} material={materials.PolishedMetal} />
          <mesh receiveShadow castShadow geometry={nodes.tischFlanschplatten.geometry} material={materials.LightBlueSilver} />
          <mesh receiveShadow castShadow ref={tableSpindleRight} geometry={nodes.tischSpindelRechts.geometry} material={materials.PolishedMetal} position={[61.35, 83.85, -0.01]} rotation={[0, 0, axisPosition.y * 20]} />
          <mesh receiveShadow castShadow geometry={nodes.tischSpindelLinks.geometry} material={materials.PolishedMetal} position={[-61.35, 83.85, -0.01]} />
          <mesh receiveShadow castShadow geometry={nodes.tischGestell.geometry} material={materials.AnodizedBlue} />
          <mesh receiveShadow castShadow geometry={nodes.tischSchrauben.geometry} material={materials.PolishedMetal} />
          <mesh receiveShadow castShadow geometry={nodes.tischFuesse.geometry} material={materials.BlackMatte} />
          <mesh receiveShadow castShadow geometry={nodes.tischPlatte.geometry} material={materials.MDF} />
        </group>
      </>
    )
  }

  function CNCMillXAxis({ ...props }) {
    const group = useRef()
    const { nodes, materials } = useGLTF('/CNCMillCompressed.glb')

    return (
      <group ref={group} {...props} dispose={null} scale={.01} position={[axisPosition.x, -.7, axisPosition.y]}>
        <mesh receiveShadow castShadow geometry={nodes.xMutter.geometry} material={materials.AnodizedSilver} />
        <mesh receiveShadow castShadow geometry={nodes.xSpindel.geometry} material={materials.PolishedMetal} position={[0, 139.73, -5.59]} rotation={[0, axisPosition.z * 100, 0]} />
        <mesh receiveShadow castShadow geometry={nodes.xSchienen.geometry} material={materials.PolishedMetal} />
        <mesh receiveShadow castShadow geometry={nodes.xSchrauben.geometry} material={materials.PolishedMetal} />
        <mesh receiveShadow castShadow geometry={nodes.xSpindelHalter.geometry} material={materials.BlackMatte} />
        <mesh receiveShadow castShadow geometry={nodes.xKreuzplatte.geometry} material={materials.AnodizedBlue} />
        <mesh receiveShadow castShadow geometry={nodes.xWagen.geometry} material={materials.BlackMatte} />
      </group>
    )
  }

  function CNCMillZAxis({ ...props }) {
    const group = useRef()
    const spindleRef = useRef()
    const { nodes, materials } = useGLTF('/CNCMillCompressed.glb')

    useFrame(() => {
      if (spindelRunning) {
        console.log(spindleRef.current);
        spindleRef.current.rotation.y -= 2
      }
    })

    return (
      <group ref={group} {...props} dispose={null} scale={.01} position={[axisPosition.x, axisPosition.z - 0.7, axisPosition.y]}>
        <mesh receiveShadow castShadow ref={spindleRef} geometry={nodes.freaser.geometry} material={materials.PolishedMetal} position={[0, 96.61, 4.26]} />
        <mesh receiveShadow castShadow geometry={nodes.fraesSpindelPolished.geometry} material={materials.AnodizedSilver} />
        <mesh receiveShadow castShadow geometry={nodes.zAchse.geometry} material={materials.AnodizedBlue} />
        <mesh receiveShadow castShadow geometry={nodes.zSchrauben.geometry} material={materials.PolishedMetal} />
        <mesh receiveShadow castShadow geometry={nodes.fraesSpindel.geometry} material={materials.LightBlueSilver} />
        <mesh receiveShadow castShadow geometry={nodes.zMutter.geometry} material={materials.AnodizedSilver} />
        <mesh receiveShadow castShadow geometry={nodes.freasSpindelDeepBlack.geometry} material={materials.DeepBlack} />
      </group>
    )
  }

  useEffect(() => {
    if (spindelRunning) {
      play({id:'spindle'})
    } else {
      stop()
    }

  }, [spindelRunning])

  return (
    <div className="App">
      <div className='coltrolPandel'>
        <h1>Control Panel</h1>
        <div className="axisContainer">
          <div className="buttonContainer">
            <button
              onMouseDown={() => { moveAxis('y', 'backward') }}
              onMouseUp={() => stopAxis('y')}
              onMouseLeave={() => stopAxis('y')}
            >
              Y +
            </button>
            <button
              onMouseDown={() => { moveAxis('y', 'forward') }}
              onMouseUp={() => stopAxis('y')}
              onMouseLeave={() => stopAxis('y')}
            >
              Y -
            </button>
          </div>
          <h2>{axisPosition.y.toFixed(2)}</h2>
        </div>
        <div className="axisContainer">
          <div className="buttonContainer">
            <button
              onMouseDown={() => { moveAxis('x', 'forward') }}
              onMouseUp={() => stopAxis('x')}
              onMouseLeave={() => stopAxis('x')}
            >
              X +
            </button>
            <button
              onMouseDown={() => { moveAxis('x', 'backward') }}
              onMouseUp={() => stopAxis('x')}
              onMouseLeave={() => stopAxis('x')}
            >
              X -
            </button>
          </div>

          <h2>{axisPosition.x.toFixed(2)}</h2>
        </div>
        <div className="axisContainer">
          <div className="buttonContainer">
            <button
              onMouseDown={() => { moveAxis('z', 'forward') }}
              onMouseUp={() => stopAxis('z')}
              onMouseLeave={() => stopAxis('z')}
            >
              Z +
            </button>
            <button
              onMouseDown={() => { moveAxis('z', 'backward') }}
              onMouseUp={() => stopAxis('z')}
              onMouseLeave={() => stopAxis('z')}
            >
              Z -
            </button>
          </div>
          <h2>{axisPosition.z.toFixed(2)}</h2>
        </div>
        <button onClick={() => {setSpindelrunning(prevState => !prevState)}}>
          {spindelRunning ? 'Turn off Spindle' : 'Turn on Spindle'}</button>
          <button onClick={homeMaschin}>Home Maschin</button>
      </div>
      <Canvas shadows camera={{ position: [2.5, 1, 2], fov: 50 }} >
        <ambientLight intensity={0.5} />
        <spotLight intensity={0.3} position={[5, 20, 20]} castShadow />
        <Suspense fallback={null}>
          <CNCMillGantry />
          <CNCMillTable />
          <CNCMillXAxis />
          <CNCMillZAxis />
          {/* <Shoe /> */}
          <Environment files='industrial_workshop_foundry_1k.hdr' />
          <ContactShadows position={[0, -0.73, 0]} opacity={0.4} scale={20} blur={.8} far={10} />
        </Suspense>
        <OrbitControls maxPolarAngle={Math.PI / 2} />
        {/* minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} enableZoom={true} enablePan={true}  */}
      </Canvas>
    </div>
  )
}

export default App
