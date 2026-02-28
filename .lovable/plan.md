

## Plan: Llevar la Landing Page al siguiente nivel de interactividad

Tras analizar todas las secciones actuales, la landing tiene buen contenido pero las interacciones son repetitivas (fade-in + hover lift en todas las cards). Falta diferenciación visual entre secciones y elementos que enganchen al usuario activamente.

### Mejoras planificadas

**1. Hero: Typing effect + contador de agentes en vivo**
- Agregar efecto de escritura animada en el título principal (typewriter con cursor parpadeante)
- Reemplazar el subtítulo estático con una rotación de frases clave usando `AnimatePresence`
- Agregar un mini-contador "live" de agentes conectados con pulso verde

**2. Comisiones: Calculadora interactiva**
- Convertir los tiers estáticos en un slider interactivo donde el usuario arrastra para ver cuánto ganaría
- Al mover el slider, se actualiza en tiempo real: monto invertido → tier → comisión estimada → ganancia con red
- Animación de números que cambian con spring physics

**3. "Cómo funciona": Timeline animada con progreso al scroll**
- Reemplazar las 3 cards estáticas por un stepper vertical con barra de progreso que se llena con el scroll
- Cada paso se "activa" visualmente al llegar a él (border glow + icono animado)
- Conectores animados entre pasos

**4. Testimonios: Carrusel con autoplay + parallax cards**
- Reemplazar el grid estático de 3 cards por un carrusel infinito con embla-carousel
- Cards con efecto 3D tilt al hover (mouse tracking)
- Autoplay con pausa al hover

**5. Social Proof Strip: Marquee infinito**
- Convertir el strip estático en un ticker/marquee horizontal infinito con logos, métricas y micro-testimonios
- Scroll automático continuo sin pausa

**6. Sección "Para quién": Flip cards interactivas**
- Las listas de "Sí es para vos" / "No es para vos" se convierten en cards que hacen flip 3D al click/tap
- Frente: icono + título corto
- Reverso: descripción completa

**7. Growth Timeline: Barra de progreso animada**
- La sección de cronograma realista tendrá una progress bar horizontal que avanza con scroll
- Cada fase se ilumina secuencialmente con partículas doradas

**8. CTA Final: Efecto de partículas + shake en botón**
- Agregar burst de partículas detrás del botón CTA
- Micro-animación de "shake" sutil periódica para llamar la atención
- Efecto de ondas (ripple) al hacer click

**9. Nuevos CSS utilities**
- Agregar `perspective` y `transform-style: preserve-3d` para flip cards
- Agregar keyframes para marquee infinito
- Agregar keyframes para shake sutil

### Archivos a modificar
- `src/components/landing/HeroAgents.tsx` — typing effect + rotating phrases
- `src/components/landing/CommissionsSection.tsx` — slider calculadora interactiva
- `src/components/landing/HowItWorksSection.tsx` — stepper con scroll progress
- `src/components/landing/TestimonialsSection.tsx` — carrusel 3D tilt
- `src/components/landing/SocialProofStrip.tsx` — marquee infinito
- `src/components/landing/ForWhoSection.tsx` — flip cards
- `src/components/landing/GrowthSection.tsx` — progress bar animada
- `src/components/landing/CTAFinalSection.tsx` — partículas + shake
- `src/index.css` — nuevos keyframes y utilities

### Dependencias existentes que se aprovechan
- `framer-motion` — para todas las animaciones avanzadas y gestures
- `embla-carousel-react` — para el carrusel de testimonios
- `@radix-ui/react-slider` — para la calculadora de comisiones
- CSS custom properties ya definidas (gold, primary, neon-green)

### Secciones sin cambios
- ProblemSection, OpportunitySection, VideoSection, BenefitsSection, CompetitiveSection, AcquisitionSection, NextStepsSection, FAQSection — se mantienen como están para no sobrecargar

