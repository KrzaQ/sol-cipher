<script setup lang="ts">
import SolCipherLogo from './components/SolCipherLogo.vue'
import PasswordSidebar from './components/PasswordSidebar.vue'
import CollapsibleSection from './components/CollapsibleSection.vue'
import CharactersSection from './components/CharactersSection.vue'
import DjinnSection from './components/DjinnSection.vue'
import ItemsSection from './components/ItemsSection.vue'
import MiscSection from './components/MiscSection.vue'
import ItemCatalog from './components/ItemCatalog.vue'
</script>

<template>
  <div class="h-dvh flex flex-col overflow-y-auto lg:overflow-hidden">
    <header class="shrink-0 relative flex items-center justify-center border-b border-gray-700 bg-gray-950 px-4 py-5 overflow-hidden">
      <SolCipherLogo :size="140" class="absolute opacity-70" />
      <div class="relative z-10 flex flex-col items-center">
        <h1 class="text-5xl tracking-widest uppercase banner-title px-4 pb-1">Sol Cipher</h1>
        <a href="https://github.com/KrzaQ/sol-cipher/" class="self-end text-xs tracking-[4px] uppercase text-amber-600/70 hover:text-amber-500 -mt-1 mr-1">by KrzaQ</a>
      </div>
      <div class="banner-particles" aria-hidden="true">
        <span v-for="n in 25" :key="n" class="particle" :style="{
          left: (15 + Math.random() * 70) + '%',
          top: (10 + Math.random() * 80) + '%',
          animationDelay: (n * 0.3) + 's',
          animationDuration: (3 + (n % 4)) + 's',
          width: (2 + (n % 3)) + 'px',
          height: (2 + (n % 3)) + 'px',
        }" />
      </div>
    </header>

    <div class="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:grid lg:grid-cols-[224px_minmax(0,40rem)_224px] lg:justify-center">
    <aside class="border-b lg:border-b-0 lg:border-r border-gray-700 p-4 lg:sticky lg:top-0 lg:self-start">
      <PasswordSidebar />
    </aside>

    <main class="p-4 space-y-4">
      <CollapsibleSection title="Characters">
        <CharactersSection />
      </CollapsibleSection>
      <DjinnSection />
      <ItemsSection />
      <MiscSection />
    </main>

    <aside class="hidden lg:block lg:border-l border-gray-700 p-4 lg:sticky lg:top-0 lg:self-start">
      <ItemCatalog />
    </aside>
    </div>
  </div>
</template>

<style scoped>
.banner-title {
  font-family: 'Cinzel Decorative', serif;
  font-weight: 900;
  background: linear-gradient(180deg, #fff8e0 0%, #ffd700 20%, #e8a800 45%, #c77800 60%, #a05500 80%, #7a3300 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 8px rgba(255, 180, 40, 0.5)) drop-shadow(0 0 30px rgba(255, 120, 0, 0.3));
}
.banner-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  background: #ffd700;
  opacity: 0;
  animation: particleFloat 4s ease-in-out infinite;
}
@keyframes particleFloat {
  0% { opacity: 0; transform: translateY(0) scale(0.5); }
  20% { opacity: 0.7; }
  80% { opacity: 0.3; }
  100% { opacity: 0; transform: translateY(-30px) scale(0); }
}
</style>
