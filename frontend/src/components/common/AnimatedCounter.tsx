import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface Props {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export default function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: Props) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })
  const startedRef = useRef(false)

  useEffect(() => {
    if (inView && !startedRef.current) {
      startedRef.current = true
      const startTime = Date.now()
      const step = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * end))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
