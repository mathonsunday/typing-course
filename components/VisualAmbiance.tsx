'use client'

import { useEffect, useRef } from 'react'

export type AmbianceStyle = 'none' | 'particles' | 'both'

interface VisualAmbianceProps {
  style: AmbianceStyle
  intensity?: number // 0-1, affects opacity/speed
}

export default function VisualAmbiance({ style, intensity = 0.5 }: VisualAmbianceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const gradientPhaseRef = useRef(0)
  
  useEffect(() => {
    if (style === 'none') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Initialize particles
    if (style === 'particles' || style === 'both') {
      const particleCount = Math.floor(50 * intensity) + 20 // More particles, minimum 20
      particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas))
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw gradient background (only with particles in 'both' mode)
      if (style === 'both') {
        drawGradient(ctx, canvas, gradientPhaseRef.current, intensity)
        gradientPhaseRef.current += 0.002 * intensity
      }
      
      // Draw particles
      if (style === 'particles' || style === 'both') {
        drawParticles(ctx, canvas, particlesRef.current, intensity)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [style, intensity])
  
  if (style === 'none') return null
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  )
}

// Particle type
interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  hue: number
}

function createParticle(canvas: HTMLCanvasElement): Particle {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 4 + 2, // Larger particles
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: (Math.random() - 0.5) * 0.4 - 0.15, // Slight upward drift
    opacity: Math.random() * 0.5 + 0.4, // More opaque
    hue: Math.random() * 60 + 220, // Blue to purple range
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  particles: Particle[],
  intensity: number
): void {
  particles.forEach(particle => {
    // Update position
    particle.x += particle.speedX
    particle.y += particle.speedY
    
    // Wrap around edges
    if (particle.x < 0) particle.x = canvas.width
    if (particle.x > canvas.width) particle.x = 0
    if (particle.y < 0) particle.y = canvas.height
    if (particle.y > canvas.height) particle.y = 0
    
    // Slowly drift hue
    particle.hue += 0.1
    if (particle.hue > 280) particle.hue = 220
    
    // Draw particle
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${particle.hue}, 70%, 65%, ${particle.opacity * intensity})`
    ctx.fill()
    
    // Add glow effect
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${particle.hue}, 60%, 55%, ${particle.opacity * intensity * 0.3})`
    ctx.fill()
  })
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  phase: number,
  intensity: number
): void {
  // Create slowly shifting gradient
  const gradient = ctx.createRadialGradient(
    canvas.width * (0.3 + Math.sin(phase) * 0.2),
    canvas.height * (0.3 + Math.cos(phase * 0.7) * 0.2),
    0,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.8
  )
  
  // Deep purple to dark blue gradient that shifts - more visible
  const hue1 = 250 + Math.sin(phase) * 20
  const hue2 = 220 + Math.cos(phase * 0.5) * 20
  
  gradient.addColorStop(0, `hsla(${hue1}, 60%, 25%, ${intensity * 0.5})`)
  gradient.addColorStop(0.5, `hsla(${hue2}, 50%, 18%, ${intensity * 0.35})`)
  gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Second gradient for more depth
  const gradient2 = ctx.createRadialGradient(
    canvas.width * (0.7 + Math.cos(phase * 0.8) * 0.2),
    canvas.height * (0.7 + Math.sin(phase * 0.6) * 0.2),
    0,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.6
  )
  
  const hue3 = 280 + Math.sin(phase * 0.3) * 30
  
  gradient2.addColorStop(0, `hsla(${hue3}, 60%, 25%, ${intensity * 0.35})`)
  gradient2.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
  
  ctx.fillStyle = gradient2
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}
