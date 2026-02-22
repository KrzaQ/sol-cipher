<template>
  <svg :width="size" :height="size" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="sun-glow">
    <defs>
      <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fffbe6"/>
        <stop offset="30%" stop-color="#ffd700"/>
        <stop offset="70%" stop-color="#e8a800"/>
        <stop offset="100%" stop-color="#b07800"/>
      </radialGradient>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffd700" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#ffd700" stop-opacity="0"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Outer glow -->
    <circle cx="100" cy="100" r="90" fill="url(#sunGlow)" class="core-pulse"/>

    <!-- Rotating rays -->
    <g class="ray-group" filter="url(#glow)">
      <polygon points="100,15 105,70 100,60 95,70" fill="#e8a800" opacity="0.8"/>
      <polygon points="100,185 105,130 100,140 95,130" fill="#e8a800" opacity="0.8"/>
      <polygon points="15,100 70,95 60,100 70,105" fill="#e8a800" opacity="0.8"/>
      <polygon points="185,100 130,95 140,100 130,105" fill="#e8a800" opacity="0.8"/>
      <polygon points="40,40 75,80 68,75 80,75" fill="#c78800" opacity="0.6"/>
      <polygon points="160,40 125,80 132,75 120,75" fill="#c78800" opacity="0.6"/>
      <polygon points="40,160 75,120 68,125 80,125" fill="#c78800" opacity="0.6"/>
      <polygon points="160,160 125,120 132,125 120,125" fill="#c78800" opacity="0.6"/>
    </g>

    <!-- Inner ring -->
    <circle cx="100" cy="100" r="38" fill="none" stroke="#c7962e" stroke-width="1.5" opacity="0.6"/>
    <circle cx="100" cy="100" r="42" fill="none" stroke="#7a5a1e" stroke-width="0.5" opacity="0.4"/>

    <!-- Core orb -->
    <circle cx="100" cy="100" r="30" fill="url(#sunCore)" class="core-pulse"/>

    <!-- Inner cross detail -->
    <path d="M100 80V120" stroke="#a06800" stroke-width="2" opacity="0.5"/>
    <path d="M80 100H120" stroke="#a06800" stroke-width="2" opacity="0.5"/>
    <circle cx="100" cy="100" r="8" fill="none" stroke="#fffbe6" stroke-width="1" opacity="0.6"/>
    <circle cx="100" cy="100" r="3" fill="#fffbe6" opacity="0.9"/>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 32 });
</script>

<style scoped>
.sun-glow {
  filter: drop-shadow(0 0 20px rgba(255, 180, 40, 0.6)) drop-shadow(0 0 60px rgba(255, 120, 0, 0.25));
}
.ray-group {
  transform-origin: center;
  animation: spin 60s linear infinite;
}
.core-pulse {
  animation: pulse 3s ease-in-out infinite;
  transform-origin: center;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
</style>
