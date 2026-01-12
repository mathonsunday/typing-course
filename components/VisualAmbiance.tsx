'use client'

import { useEffect, useRef, useCallback } from 'react'

export type AmbianceStyle = 'none' | 'particles' | 'both'

interface VisualAmbianceProps {
  style: AmbianceStyle
  intensity?: number // 0-1, affects opacity/speed
}

export default function VisualAmbiance({ style, intensity = 0.5 }: VisualAmbianceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const connectionsRef = useRef<Connection[]>([])
  const orbsRef = useRef<Orb[]>([])
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
    
    // Track mouse for subtle interactivity
    window.addEventListener('mousemove', handleMouseMove)
    
    // Set canvas size with DPR for crisp rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Initialize particles (more ethereal floating particles)
    if (style === 'particles' || style === 'both') {
      const particleCount = Math.floor(80 * intensity) + 30
      particlesRef.current = Array.from({ length: particleCount }, () => createParticle(window.innerWidth, window.innerHeight))
      
      // Create floating orbs for ambient glow
      orbsRef.current = Array.from({ length: 5 }, () => createOrb(window.innerWidth, window.innerHeight))
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      timeRef.current += 0.016 // ~60fps
      
      // Layer 1: Ambient gradient orbs (only in 'both' mode)
      if (style === 'both') {
        drawFloatingOrbs(ctx, orbsRef.current, timeRef.current, intensity)
      }
      
      // Layer 2: Particle constellation
      if (style === 'particles' || style === 'both') {
        updateAndDrawParticles(
          ctx, 
          particlesRef.current, 
          connectionsRef.current,
          window.innerWidth, 
          window.innerHeight,
          mouseRef.current,
          timeRef.current,
          intensity,
          style === 'both'
        )
      }
      
      // Layer 3: Subtle vignette
      drawVignette(ctx, window.innerWidth, window.innerHeight, intensity)
      
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

// ============ Types ============

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
  phase: number // For individual wave motion
  pulseSpeed: number
  orbitRadius: number
  orbitSpeed: number
}

interface Connection {
  from: number
  to: number
  opacity: number
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

// ============ Creation Functions ============

function createParticle(width: number, height: number): Particle {
  const x = Math.random() * width
  const y = Math.random() * height
  
  // Color palette: electric blues, soft purples, subtle cyans
  const colorChoice = Math.random()
  let hue, saturation, lightness
  
  if (colorChoice < 0.4) {
    // Electric blue
    hue = 210 + Math.random() * 30
    saturation = 70 + Math.random() * 20
    lightness = 55 + Math.random() * 15
  } else if (colorChoice < 0.7) {
    // Soft purple/violet
    hue = 260 + Math.random() * 30
    saturation = 60 + Math.random() * 25
    lightness = 60 + Math.random() * 15
  } else if (colorChoice < 0.9) {
    // Cyan accent
    hue = 180 + Math.random() * 20
    saturation = 65 + Math.random() * 20
    lightness = 55 + Math.random() * 15
  } else {
    // Rare warm accent (adds depth)
    hue = 280 + Math.random() * 40
    saturation = 50 + Math.random() * 30
    lightness = 65 + Math.random() * 10
  }
  
  return {
    x,
    y,
    baseX: x,
    baseY: y,
    size: Math.random() * 2.5 + 0.5,
    speedX: (Math.random() - 0.5) * 0.15,
    speedY: (Math.random() - 0.5) * 0.15 - 0.08, // Slight upward drift
    opacity: Math.random() * 0.5 + 0.3,
    hue,
    saturation,
    lightness,
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
    hue: 220 + Math.random() * 60, // Blue to purple
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.2 + Math.random() * 0.3,
  }
}

// ============ Drawing Functions ============

function updateAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  connections: Connection[],
  width: number,
  height: number,
  mouse: { x: number; y: number },
  time: number,
  intensity: number,
  drawConnections: boolean
): void {
  // Update connections (find nearby particles)
  if (drawConnections) {
    connections.length = 0
    const connectionDistance = 120 * intensity
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < connectionDistance) {
          connections.push({
            from: i,
            to: j,
            opacity: 1 - dist / connectionDistance
          })
        }
      }
    }
    
    // Draw connections first (behind particles)
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
  
  // Update and draw particles
  particles.forEach(particle => {
    // Organic floating motion
    particle.phase += particle.pulseSpeed * 0.02
    
    // Calculate orbit offset
    const orbitX = Math.cos(time * particle.orbitSpeed + particle.phase) * particle.orbitRadius * 0.5
    const orbitY = Math.sin(time * particle.orbitSpeed * 0.7 + particle.phase) * particle.orbitRadius * 0.3
    
    // Update base position
    particle.baseX += particle.speedX
    particle.baseY += particle.speedY
    
    // Apply orbit to get final position
    particle.x = particle.baseX + orbitX
    particle.y = particle.baseY + orbitY
    
    // Subtle mouse influence (particles drift away slightly)
    const dx = particle.x - mouse.x
    const dy = particle.y - mouse.y
    const distToMouse = Math.sqrt(dx * dx + dy * dy)
    const mouseInfluence = 150
    
    if (distToMouse < mouseInfluence) {
      const force = (1 - distToMouse / mouseInfluence) * 0.5
      particle.x += dx * force * 0.02
      particle.y += dy * force * 0.02
    }
    
    // Wrap around edges with padding
    const padding = 50
    if (particle.baseX < -padding) particle.baseX = width + padding
    if (particle.baseX > width + padding) particle.baseX = -padding
    if (particle.baseY < -padding) particle.baseY = height + padding
    if (particle.baseY > height + padding) particle.baseY = -padding
    
    // Pulsing opacity
    const pulse = Math.sin(particle.phase) * 0.2 + 0.8
    const currentOpacity = particle.opacity * pulse * intensity
    
    // Pulsing size
    const sizeMultiplier = 1 + Math.sin(particle.phase * 1.3) * 0.2
    const currentSize = particle.size * sizeMultiplier
    
    // Draw glow (larger, softer)
    const glowSize = currentSize * 8
    const glowGradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, glowSize
    )
    glowGradient.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${currentOpacity * 0.4})`)
    glowGradient.addColorStop(0.4, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${currentOpacity * 0.15})`)
    glowGradient.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, 0)`)
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw core particle
    ctx.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness + 15}%, ${currentOpacity})`
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw bright center
    ctx.fillStyle = `hsla(${particle.hue}, ${particle.saturation - 20}%, ${particle.lightness + 30}%, ${currentOpacity * 0.8})`
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, currentSize * 0.4, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawFloatingOrbs(
  ctx: CanvasRenderingContext2D,
  orbs: Orb[],
  time: number,
  intensity: number
): void {
  orbs.forEach(orb => {
    // Update position
    orb.x += orb.speedX
    orb.y += orb.speedY
    
    // Bounce off edges softly
    if (orb.x < -orb.radius || orb.x > ctx.canvas.width / (window.devicePixelRatio || 1) + orb.radius) {
      orb.speedX *= -1
    }
    if (orb.y < -orb.radius || orb.y > ctx.canvas.height / (window.devicePixelRatio || 1) + orb.radius) {
      orb.speedY *= -1
    }
    
    // Pulsing
    orb.pulsePhase += orb.pulseSpeed * 0.02
    const pulse = Math.sin(orb.pulsePhase) * 0.15 + 0.85
    const currentRadius = orb.radius * pulse
    
    // Slowly shift hue
    orb.hue += 0.02
    if (orb.hue > 280) orb.hue = 220
    
    // Draw orb as soft radial gradient
    const gradient = ctx.createRadialGradient(
      orb.x, orb.y, 0,
      orb.x, orb.y, currentRadius
    )
    
    gradient.addColorStop(0, `hsla(${orb.hue}, 50%, 35%, ${intensity * 0.15})`)
    gradient.addColorStop(0.3, `hsla(${orb.hue}, 45%, 25%, ${intensity * 0.1})`)
    gradient.addColorStop(0.6, `hsla(${orb.hue + 20}, 40%, 18%, ${intensity * 0.05})`)
    gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(
      orb.x - currentRadius, 
      orb.y - currentRadius, 
      currentRadius * 2, 
      currentRadius * 2
    )
  })
}

function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
): void {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.3,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.8
  )
  
  gradient.addColorStop(0, 'hsla(0, 0%, 0%, 0)')
  gradient.addColorStop(0.5, `hsla(240, 30%, 5%, ${intensity * 0.1})`)
  gradient.addColorStop(1, `hsla(240, 40%, 3%, ${intensity * 0.25})`)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}
