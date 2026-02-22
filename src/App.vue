<script setup lang="ts">
import PasswordSidebar from './components/PasswordSidebar.vue'
import CollapsibleSection from './components/CollapsibleSection.vue'
import CharactersSection from './components/CharactersSection.vue'
import DjinnSection from './components/DjinnSection.vue'
import ItemsSection from './components/ItemsSection.vue'
import MiscSection from './components/MiscSection.vue'
import ItemCatalog from './components/ItemCatalog.vue'
</script>

<template>
  <div class="h-dvh flex flex-col overflow-y-auto
              lg:overflow-hidden lg:grid lg:grid-cols-[280px_minmax(0,40rem)_280px] lg:justify-center">
    <aside class="border-b lg:border-b-0 lg:border-r border-gray-200 lg:overflow-y-auto p-4 lg:self-center">
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

    <aside class="border-t lg:border-t-0 lg:border-l border-gray-200 lg:overflow-y-auto p-4 lg:self-center">
      <ItemCatalog />
    </aside>
  </div>
</template>
