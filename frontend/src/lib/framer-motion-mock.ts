// Dynamic import wrapper for framer-motion to avoid SSR issues
import dynamic from 'next/dynamic'

export const motion = {
  div: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.div })), { ssr: false }),
  span: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.span })), { ssr: false }),
  p: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.p })), { ssr: false }),
  h1: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.h1 })), { ssr: false }),
  h2: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.h2 })), { ssr: false }),
  h3: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.h3 })), { ssr: false }),
  h4: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.h4 })), { ssr: false }),
  h5: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.h5 })), { ssr: false }),
  h6: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.h6 })), { ssr: false }),
  button: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.button })), { ssr: false }),
  a: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.a })), { ssr: false }),
  img: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.img })), { ssr: false }),
  ul: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.ul })), { ssr: false }),
  li: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.li })), { ssr: false }),
  section: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.section })), { ssr: false }),
  article: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.article })), { ssr: false }),
  header: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.header })), { ssr: false }),
  footer: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.footer })), { ssr: false }),
  nav: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.nav })), { ssr: false }),
  aside: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.aside })), { ssr: false }),
  main: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.main })), { ssr: false })
}

export const AnimatePresence = dynamic(() => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })), { ssr: false })

export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {}
})

export const useInView = () => [false, {}]

export const useMotionValue = (initial: any) => ({
  get: () => initial,
  set: () => {},
  onChange: () => () => {}
})

export const animate = () => Promise.resolve()
