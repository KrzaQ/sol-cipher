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
  <div class="h-dvh flex flex-col overflow-y-auto lg:overflow-hidden lg:grid lg:grid-rows-[auto_1fr] lg:grid-cols-[280px_minmax(0,40rem)_280px] lg:justify-center">
    <header class="col-span-full relative flex items-center justify-center border-b border-gray-700 bg-gray-950 px-4 py-5 overflow-hidden">
      <SolCipherLogo :size="100" class="absolute opacity-70" />
      <h1 class="relative text-5xl tracking-widest uppercase banner-title z-10">Sol Cipher</h1>
      <div class="banner-particles" aria-hidden="true">
        <span v-for="n in 15" :key="n" class="particle" :style="{
          left: (15 + Math.random() * 70) + '%',
          top: (10 + Math.random() * 80) + '%',
          animationDelay: (n * 0.3) + 's',
          animationDuration: (3 + (n % 4)) + 's',
          width: (2 + (n % 3)) + 'px',
          height: (2 + (n % 3)) + 'px',
        }" />
      </div>
      <a href="https://github.com/KrzaQ/sol-cipher/" class="absolute bottom-1 right-4 text-[10px] tracking-widest uppercase text-amber-700/60 hover:text-amber-500 z-10">by KrzaQ</a>
    </header>

    <aside class="border-b lg:border-b-0 lg:border-r border-gray-700 lg:overflow-y-auto p-4 lg:self-center">
      <PasswordSidebar />
    </aside>

    <main class="lg:overflow-y-auto p-4 space-y-4 min-h-0">
      <CollapsibleSection title="Characters">
        <CharactersSection />
      </CollapsibleSection>
      <CollapsibleSection title="Djinn">
        <DjinnSection />
      </CollapsibleSection>
      <CollapsibleSection title="Items">
        <ItemsSection />
      </CollapsibleSection>
      <CollapsibleSection title="Miscellaneous">
        <MiscSection />
      </CollapsibleSection>
    </main>

    <aside class="border-t lg:border-t-0 lg:border-l border-gray-700 lg:overflow-y-auto p-4 lg:self-center">
      <ItemCatalog />
    </aside>
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
