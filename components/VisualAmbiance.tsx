'use client'

import { useEffect, useRef, useCallback } from 'react'

export type AmbianceStyle = 'none' | 'particles' | 'both' | 'geometric' | 'fireflies' | 'nebula'

interface VisualAmbianceProps {
  style: AmbianceStyle
  intensity?: number // 0-1, affects opacity/speed
}

export default function VisualAmbiance({ style, intensity = 0.5 }: VisualAmbianceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const stateRef = useRef<any>({})
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])
  
  useEffect(() => {
    if (style === 'none') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    window.addEventListener('mousemove', handleMouseMove)
    
    // Set canvas size
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
      
      // Reinitialize state on resize
      initializeState(style, window.innerWidth, window.innerHeight, stateRef, intensity)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Initialize state
    initializeState(style, window.innerWidth, window.innerHeight, stateRef, intensity)
    
    // Animation loop
    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      ctx.clearRect(0, 0, width, height)
      timeRef.current += 0.016
      
      switch (style) {
        case 'particles':
          drawParticles(ctx, stateRef.current, width, height, mouseRef.current, timeRef.current, intensity, false)
          break
        case 'both':
          drawConstellation(ctx, stateRef.current, width, height, mouseRef.current, timeRef.current, intensity)
          break
        case 'geometric':
          drawGeometric(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
        case 'fireflies':
          drawFireflies(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
        case 'nebula':
          drawNebula(ctx, stateRef.current, width, height, timeRef.current, intensity)
          break
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [style, intensity, handleMouseMove])
  
  if (style === 'none') return null
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}

// ============ State Initialization ============

function initializeState(
  style: AmbianceStyle,
  width: number,
  height: number,
  stateRef: React.MutableRefObject<any>,
  intensity: number
) {
  switch (style) {
    case 'particles':
    case 'both':
      const particleCount = Math.floor(80 * intensity) + 30
      stateRef.current = {
        particles: Array.from({ length: particleCount }, () => createParticle(width, height)),
        orbs: Array.from({ length: 5 }, () => createOrb(width, height)),
        connections: []
      }
      break
      
    case 'geometric':
      stateRef.current = {
        nodes: createHexGrid(width, height),
        phase: 0
      }
      break
      
    case 'fireflies':
      const fireflyCount = Math.floor(40 * intensity) + 15
      stateRef.current = {
        fireflies: Array.from({ length: fireflyCount }, () => createFirefly(width, height)),
      }
      break
      
    case 'nebula':
      stateRef.current = {
        clouds: Array.from({ length: 6 }, (_, i) => createCloud(width, height, i)),
        stars: Array.from({ length: Math.floor(100 * intensity) + 50 }, () => createStar(width, height)),
      }
      break
  }
}

// ============ Particle Types & Functions (existing) ============

interface Particle {
  x: number
  y: number
  baseX: number
  baseY: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  hue: number
  saturation: number
  lightness: number
  phase: number
  pulseSpeed: number
  orbitRadius: number
  orbitSpeed: number
}

interface Orb {
  x: number
  y: number
  radius: number
  hue: number
  speedX: number
  speedY: number
  pulsePhase: number
  pulseSpeed: number
}

function createParticle(width: number, height: number): Particle {
  const x = Math.random() * width
  const y = Math.random() * height
  const colorChoice = Math.random()
  let hue, saturation, lightness
  
  if (colorChoice < 0.4) {
    hue = 210 + Math.random() * 30
    saturation = 70 + Math.random() * 20
    lightness = 55 + Math.random() * 15
  } else if (colorChoice < 0.7) {
    hue = 260 + Math.random() * 30
    saturation = 60 + Math.random() * 25
    lightness = 60 + Math.random() * 15
  } else if (colorChoice < 0.9) {
    hue = 180 + Math.random() * 20
    saturation = 65 + Math.random() * 20
    lightness = 55 + Math.random() * 15
  } else {
    hue = 280 + Math.random() * 40
    saturation = 50 + Math.random() * 30
    lightness = 65 + Math.random() * 10
  }
  
  return {
    x, y, baseX: x, baseY: y,
    size: Math.random() * 2.5 + 0.5,
    speedX: (Math.random() - 0.5) * 0.15,
    speedY: (Math.random() - 0.5) * 0.15 - 0.08,
    opacity: Math.random() * 0.5 + 0.3,
    hue, saturation, lightness,
    phase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.5 + Math.random() * 1.5,
    orbitRadius: Math.random() * 30 + 10,
    orbitSpeed: (Math.random() - 0.5) * 0.02,
  }
}

function createOrb(width: number, height: number): Orb {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 150 + Math.random() * 250,
    hue: 220 + Math.random() * 60,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.2 + Math.random() * 0.3,
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  mouse: { x: number; y: number },
  time: number,
  intensity: number,
  drawConnections: boolean
): void {
  const { particles, connections } = state
  
  if (drawConnections) {
    connections.length = 0
    const connectionDistance = 120 * intensity
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < connectionDistance) {
          connections.push({ from: i, to: j, opacity: 1 - dist / connectionDistance })
        }
      }
    }
    
    ctx.lineWidth = 0.5
    for (const conn of connections) {
      const p1 = particles[conn.from]
      const p2 = particles[conn.to]
      
      const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
      gradient.addColorStop(0, `hsla(${p1.hue}, ${p1.saturation}%, ${p1.lightness}%, ${conn.opacity * p1.opacity * intensity * 0.3})`)
      gradient.addColorStop(1, `hsla(${p2.hue}, ${p2.saturation}%, ${p2.lightness}%, ${conn.opacity * p2.opacity * intensity * 0.3})`)
      
      ctx.strokeStyle = gradient
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }
  }
  
  particles.forEach((particle: Particle) => {
    particle.phase += particle.pulseSpeed * 0.02
    const orbitX = Math.cos(time * particle.orbitSpeed + particle.phase) * particle.orbitRadius * 0.5
    const orbitY = Math.sin(time * particle.orbitSpeed * 0.7 + particle.phase) * particle.orbitRadius * 0.3
    
    particle.baseX += particle.speedX
    particle.baseY += particle.speedY
    particle.x = particle.baseX + orbitX
    particle.y = particle.baseY + orbitY
    
    const dx = particle.x - mouse.x
    const dy = particle.y - mouse.y
    const distToMouse = Math.sqrt(dx * dx + dy * dy)
    if (distToMouse < 150) {
      const force = (1 - distToMouse / 150) * 0.5
      particle.x += dx * force * 0.02
      particle.y += dy * force * 0.02
    }
    
    const padding = 50
    if (particle.baseX < -padding) particle.baseX = width + padding
    if (particle.baseX > width + padding) particle.baseX = -padding
    if (particle.baseY < -padding) particle.baseY = height + padding
    if (particle.baseY > height + padding) particle.baseY = -padding
    
    const pulse = Math.sin(particle.phase) * 0.2 + 0.8
    const currentOpacity = particle.opacity * pulse * intensity
    const sizeMultiplier = 1 + Math.sin(particle.phase * 1.3) * 0.2
    const currentSize = particle.size * sizeMultiplier
    
    const glowSize = currentSize * 8
    const glowGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, glowSize)
    glowGradient.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${currentOpacity * 0.4})`)
    glowGradient.addColorStop(0.4, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${currentOpacity * 0.15})`)
    glowGradient.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, 0)`)
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness + 15}%, ${currentOpacity})`
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawConstellation(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  mouse: { x: number; y: number },
  time: number,
  intensity: number
): void {
  // Draw floating orbs first
  state.orbs.forEach((orb: Orb) => {
    orb.x += orb.speedX
    orb.y += orb.speedY
    
    if (orb.x < -orb.radius || orb.x > width + orb.radius) orb.speedX *= -1
    if (orb.y < -orb.radius || orb.y > height + orb.radius) orb.speedY *= -1
    
    orb.pulsePhase += orb.pulseSpeed * 0.02
    const pulse = Math.sin(orb.pulsePhase) * 0.15 + 0.85
    const currentRadius = orb.radius * pulse
    
    orb.hue += 0.02
    if (orb.hue > 280) orb.hue = 220
    
    const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, currentRadius)
    gradient.addColorStop(0, `hsla(${orb.hue}, 50%, 35%, ${intensity * 0.15})`)
    gradient.addColorStop(0.3, `hsla(${orb.hue}, 45%, 25%, ${intensity * 0.1})`)
    gradient.addColorStop(0.6, `hsla(${orb.hue + 20}, 40%, 18%, ${intensity * 0.05})`)
    gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(orb.x - currentRadius, orb.y - currentRadius, currentRadius * 2, currentRadius * 2)
  })
  
  // Draw particles with connections
  drawParticles(ctx, state, width, height, mouse, time, intensity, true)
}

// ============ Geometric Effect ============

interface HexNode {
  x: number
  y: number
  baseX: number
  baseY: number
  connections: number[]
  phase: number
  pulseSpeed: number
}

function createHexGrid(width: number, height: number): HexNode[] {
  const nodes: HexNode[] = []
  const spacing = 80
  const rowHeight = spacing * Math.sin(Math.PI / 3)
  
  for (let row = -1; row <= height / rowHeight + 1; row++) {
    const offset = row % 2 === 0 ? 0 : spacing / 2
    for (let col = -1; col <= width / spacing + 1; col++) {
      nodes.push({
        x: col * spacing + offset,
        y: row * rowHeight,
        baseX: col * spacing + offset,
        baseY: row * rowHeight,
        connections: [],
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.3 + Math.random() * 0.5,
      })
    }
  }
  
  // Find connections (nearby nodes)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].baseX - nodes[j].baseX
      const dy = nodes[i].baseY - nodes[j].baseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < spacing * 1.2) {
        nodes[i].connections.push(j)
        nodes[j].connections.push(i)
      }
    }
  }
  
  return nodes
}

function drawGeometric(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const { nodes } = state
  const waveSpeed = 0.5
  const waveAmplitude = 15 * intensity
  
  // Update node positions with wave motion
  nodes.forEach((node: HexNode, i: number) => {
    node.phase += node.pulseSpeed * 0.01
    
    // Create flowing wave distortion
    const waveX = Math.sin(time * waveSpeed + node.baseY * 0.01 + node.baseX * 0.005) * waveAmplitude
    const waveY = Math.cos(time * waveSpeed * 0.7 + node.baseX * 0.01) * waveAmplitude * 0.5
    
    node.x = node.baseX + waveX
    node.y = node.baseY + waveY
  })
  
  // Draw connections
  const drawnConnections = new Set<string>()
  
  nodes.forEach((node: HexNode, i: number) => {
    node.connections.forEach((j: number) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (drawnConnections.has(key)) return
      drawnConnections.add(key)
      
      const other = nodes[j]
      const midX = (node.x + other.x) / 2
      const midY = (node.y + other.y) / 2
      
      // Color based on position
      const hue = 200 + Math.sin(time * 0.2 + midX * 0.003 + midY * 0.003) * 40
      const brightness = 0.3 + Math.sin(time * 0.5 + node.phase) * 0.15
      
      ctx.strokeStyle = `hsla(${hue}, 60%, 50%, ${brightness * intensity})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(node.x, node.y)
      ctx.lineTo(other.x, other.y)
      ctx.stroke()
    })
  })
  
  // Draw nodes with glow
  nodes.forEach((node: HexNode) => {
    const hue = 220 + Math.sin(time * 0.3 + node.phase) * 30
    const pulse = Math.sin(node.phase) * 0.3 + 0.7
    const size = 2 + pulse * 1.5
    
    // Glow
    const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 6)
    glowGradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${pulse * intensity * 0.5})`)
    glowGradient.addColorStop(0.5, `hsla(${hue}, 60%, 50%, ${pulse * intensity * 0.2})`)
    glowGradient.addColorStop(1, `hsla(${hue}, 50%, 40%, 0)`)
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(node.x, node.y, size * 6, 0, Math.PI * 2)
    ctx.fill()
    
    // Core
    ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${pulse * intensity})`
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
    ctx.fill()
  })
}

// ============ Fireflies Effect ============

interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  phase: number
  pulseSpeed: number
  glowIntensity: number
  trail: { x: number; y: number; opacity: number }[]
  targetX: number
  targetY: number
  wanderAngle: number
}

function createFirefly(width: number, height: number): Firefly {
  const x = Math.random() * width
  const y = Math.random() * height
  
  // Warm colors: yellows, warm whites, soft greens
  const colorChoice = Math.random()
  let hue
  if (colorChoice < 0.5) {
    hue = 45 + Math.random() * 20 // Golden yellow
  } else if (colorChoice < 0.8) {
    hue = 65 + Math.random() * 25 // Yellow-green
  } else {
    hue = 30 + Math.random() * 15 // Warm orange
  }
  
  return {
    x, y,
    vx: 0,
    vy: 0,
    size: 2 + Math.random() * 2,
    hue,
    phase: Math.random() * Math.PI * 2,
    pulseSpeed: 1 + Math.random() * 2,
    glowIntensity: 0.5 + Math.random() * 0.5,
    trail: [],
    targetX: x,
    targetY: y,
    wanderAngle: Math.random() * Math.PI * 2,
  }
}

function drawFireflies(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const { fireflies } = state
  
  fireflies.forEach((fly: Firefly) => {
    // Update wander behavior
    fly.wanderAngle += (Math.random() - 0.5) * 0.3
    
    // Occasionally pick new target
    if (Math.random() < 0.01) {
      fly.targetX = Math.random() * width
      fly.targetY = Math.random() * height
    }
    
    // Move towards target with wandering
    const dx = fly.targetX - fly.x
    const dy = fly.targetY - fly.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist > 10) {
      fly.vx += (dx / dist) * 0.05 + Math.cos(fly.wanderAngle) * 0.1
      fly.vy += (dy / dist) * 0.05 + Math.sin(fly.wanderAngle) * 0.1
    } else {
      fly.vx += Math.cos(fly.wanderAngle) * 0.15
      fly.vy += Math.sin(fly.wanderAngle) * 0.15
    }
    
    // Damping
    fly.vx *= 0.95
    fly.vy *= 0.95
    
    // Clamp velocity
    const speed = Math.sqrt(fly.vx * fly.vx + fly.vy * fly.vy)
    if (speed > 2) {
      fly.vx = (fly.vx / speed) * 2
      fly.vy = (fly.vy / speed) * 2
    }
    
    fly.x += fly.vx
    fly.y += fly.vy
    
    // Wrap around
    if (fly.x < -50) fly.x = width + 50
    if (fly.x > width + 50) fly.x = -50
    if (fly.y < -50) fly.y = height + 50
    if (fly.y > height + 50) fly.y = -50
    
    // Add to trail
    fly.trail.unshift({ x: fly.x, y: fly.y, opacity: 1 })
    if (fly.trail.length > 20) fly.trail.pop()
    
    // Fade trail
    fly.trail.forEach((point, i) => {
      point.opacity = 1 - (i / fly.trail.length)
    })
    
    // Update pulse
    fly.phase += fly.pulseSpeed * 0.05
    
    // Firefly pulse pattern: long dim, short bright flash
    const pulseValue = Math.pow(Math.sin(fly.phase), 8) // Sharp peaks
    const brightness = 0.2 + pulseValue * 0.8
    
    // Draw trail
    if (fly.trail.length > 1) {
      ctx.beginPath()
      ctx.moveTo(fly.trail[0].x, fly.trail[0].y)
      
      for (let i = 1; i < fly.trail.length; i++) {
        const point = fly.trail[i]
        ctx.lineTo(point.x, point.y)
      }
      
      ctx.strokeStyle = `hsla(${fly.hue}, 80%, 60%, ${brightness * intensity * 0.3})`
      ctx.lineWidth = fly.size * 0.5
      ctx.lineCap = 'round'
      ctx.stroke()
    }
    
    // Draw glow
    const glowSize = fly.size * (8 + pulseValue * 12)
    const glowGradient = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, glowSize)
    glowGradient.addColorStop(0, `hsla(${fly.hue}, 90%, 75%, ${brightness * intensity * fly.glowIntensity})`)
    glowGradient.addColorStop(0.2, `hsla(${fly.hue}, 85%, 65%, ${brightness * intensity * fly.glowIntensity * 0.6})`)
    glowGradient.addColorStop(0.5, `hsla(${fly.hue}, 80%, 55%, ${brightness * intensity * fly.glowIntensity * 0.2})`)
    glowGradient.addColorStop(1, `hsla(${fly.hue}, 70%, 45%, 0)`)
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(fly.x, fly.y, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw core
    const coreSize = fly.size * (0.8 + pulseValue * 0.5)
    ctx.fillStyle = `hsla(${fly.hue - 10}, 100%, 85%, ${brightness * intensity})`
    ctx.beginPath()
    ctx.arc(fly.x, fly.y, coreSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Bright center
    ctx.fillStyle = `hsla(${fly.hue - 20}, 100%, 95%, ${brightness * intensity * 0.8})`
    ctx.beginPath()
    ctx.arc(fly.x, fly.y, coreSize * 0.4, 0, Math.PI * 2)
    ctx.fill()
  })
}

// ============ Nebula Effect ============

interface Cloud {
  x: number
  y: number
  radius: number
  hue: number
  saturation: number
  speedX: number
  speedY: number
  noiseOffsetX: number
  noiseOffsetY: number
  opacity: number
}

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

function createCloud(width: number, height: number, index: number): Cloud {
  // Create varied nebula colors
  const palettes = [
    { hue: 280, saturation: 60 }, // Purple
    { hue: 320, saturation: 50 }, // Pink/magenta
    { hue: 220, saturation: 70 }, // Deep blue
    { hue: 200, saturation: 60 }, // Cyan-blue
    { hue: 260, saturation: 55 }, // Violet
    { hue: 340, saturation: 45 }, // Rose
  ]
  
  const palette = palettes[index % palettes.length]
  
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 200 + Math.random() * 300,
    hue: palette.hue + (Math.random() - 0.5) * 30,
    saturation: palette.saturation + (Math.random() - 0.5) * 20,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: (Math.random() - 0.5) * 0.2,
    noiseOffsetX: Math.random() * 1000,
    noiseOffsetY: Math.random() * 1000,
    opacity: 0.15 + Math.random() * 0.15,
  }
}

function createStar(width: number, height: number): Star {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.2,
    twinkleSpeed: 0.5 + Math.random() * 2,
    twinklePhase: Math.random() * Math.PI * 2,
  }
}

// Simple noise function for organic cloud shapes
function noise(x: number, y: number, time: number): number {
  const sin1 = Math.sin(x * 0.01 + time * 0.2)
  const sin2 = Math.sin(y * 0.01 + time * 0.15)
  const sin3 = Math.sin((x + y) * 0.007 + time * 0.1)
  const sin4 = Math.sin(x * 0.02 - y * 0.015 + time * 0.25)
  return (sin1 + sin2 + sin3 + sin4) / 4
}

function drawNebula(
  ctx: CanvasRenderingContext2D,
  state: any,
  width: number,
  height: number,
  time: number,
  intensity: number
): void {
  const { clouds, stars } = state
  
  // Draw clouds (layered for depth)
  clouds.forEach((cloud: Cloud, i: number) => {
    // Update position with slow drift
    cloud.x += cloud.speedX
    cloud.y += cloud.speedY
    
    // Wrap around
    if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius
    if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius
    if (cloud.y < -cloud.radius) cloud.y = height + cloud.radius
    if (cloud.y > height + cloud.radius) cloud.y = -cloud.radius
    
    // Calculate organic distortion
    const noiseVal = noise(cloud.x + cloud.noiseOffsetX, cloud.y + cloud.noiseOffsetY, time)
    const distortedRadius = cloud.radius * (1 + noiseVal * 0.3)
    
    // Slowly shift hue
    cloud.hue += 0.01
    
    // Draw cloud as multiple overlapping gradients for organic feel
    for (let layer = 0; layer < 3; layer++) {
      const layerOffset = layer * 20
      const layerRadius = distortedRadius * (1 - layer * 0.15)
      const layerOpacity = cloud.opacity * (1 - layer * 0.25) * intensity
      
      const gradient = ctx.createRadialGradient(
        cloud.x + Math.sin(time * 0.3 + layer) * layerOffset,
        cloud.y + Math.cos(time * 0.25 + layer) * layerOffset,
        0,
        cloud.x,
        cloud.y,
        layerRadius
      )
      
      const hueShift = layer * 15
      gradient.addColorStop(0, `hsla(${cloud.hue + hueShift}, ${cloud.saturation}%, 40%, ${layerOpacity})`)
      gradient.addColorStop(0.3, `hsla(${cloud.hue + hueShift + 10}, ${cloud.saturation - 10}%, 30%, ${layerOpacity * 0.7})`)
      gradient.addColorStop(0.6, `hsla(${cloud.hue + hueShift + 20}, ${cloud.saturation - 20}%, 20%, ${layerOpacity * 0.4})`)
      gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
  })
  
  // Draw stars
  stars.forEach((star: Star) => {
    star.twinklePhase += star.twinkleSpeed * 0.02
    const twinkle = Math.sin(star.twinklePhase) * 0.4 + 0.6
    const currentOpacity = star.opacity * twinkle * intensity
    
    // Star glow
    const glowSize = star.size * 4
    const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize)
    glowGradient.addColorStop(0, `hsla(220, 30%, 95%, ${currentOpacity * 0.6})`)
    glowGradient.addColorStop(0.5, `hsla(230, 40%, 85%, ${currentOpacity * 0.2})`)
    glowGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Star core
    ctx.fillStyle = `hsla(210, 20%, 98%, ${currentOpacity})`
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    ctx.fill()
  })
  
  // Add subtle vignette
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.2,
    width / 2, height / 2, Math.max(width, height) * 0.8
  )
  vignette.addColorStop(0, 'hsla(0, 0%, 0%, 0)')
  vignette.addColorStop(0.7, `hsla(260, 50%, 5%, ${intensity * 0.15})`)
  vignette.addColorStop(1, `hsla(260, 60%, 3%, ${intensity * 0.3})`)
  
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
}
