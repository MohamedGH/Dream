<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useDreams } from '~/composables/useDreams'
import { TAGS, PHASES, SOCIALS, timeAgo } from '~/utils/songes'

const { user, authLoading, authError, signingIn, login, logout } = useAuth()
const { dreams, feedLoading, subscribe, addDream, toggleResonance, addEcho } = useDreams()
const title = ref('')
const body = ref('')
const activeTags = ref([])
const phase = ref(2)
const posting = ref(false)
const openEchoes = ref({})
const echoDrafts = ref({})
let unsubscribe
onMounted(() => { unsubscribe = subscribe() })
onUnmounted(() => unsubscribe?.())
function toggleTag(id) { activeTags.value = activeTags.value.includes(id) ? activeTags.value.filter(t => t !== id) : [...activeTags.value, id] }
async function submitDream() { if (!user.value || !title.value.trim() || !body.value.trim()) return; posting.value = true; try { await addDream(user.value, { title: title.value.trim(), body: body.value.trim(), tags: activeTags.value, phase: phase.value }); title.value=''; body.value=''; activeTags.value=[]; phase.value=2 } finally { posting.value=false } }
function phaseInfo(d) { return PHASES.find(p => p.id === d.phase) || PHASES[1] }
function resonated(d) { return !!user.value && (d.resonances || []).includes(user.value.uid) }
async function submitEcho(d) { const text=(echoDrafts.value[d.id] || '').trim(); if (!user.value || !text) return; await addEcho(d,user.value,text); echoDrafts.value[d.id]='' }
</script>

<template>
  <div v-if="authLoading" class="min-h-screen grid place-items-center" style="background:#0f1229;color:#8b7fd4">⟳</div>
  <div v-else-if="!user" class="min-h-screen flex items-center justify-center px-6" style="background:#0f1229">
    <div class="w-full max-w-sm text-center"><div class="text-5xl mb-4">🌙</div><h1 class="text-3xl mb-2" style="font-family:Fraunces,serif;color:#edeaf7">Songes</h1><p class="mb-8 text-sm" style="color:#8b8aa8">Connecte-toi pour déposer et lire les songes du carnet partagé.</p><div class="flex flex-col gap-2"><button v-for="s in SOCIALS" :key="s.id" :disabled="signingIn !== null" class="w-full py-2.5 rounded-lg disabled:opacity-50" style="background:#1a1e3d;color:#edeaf7;border:1px solid #33375c" @click="login(s.id)">{{ signingIn === s.id ? '…' : '' }} Continuer avec {{ s.label }}</button></div><p v-if="authError" class="mt-4 text-sm" style="color:#e8a8a8">{{ authError }}</p></div>
  </div>
  <div v-else class="min-h-screen pb-16" style="background:#0f1229;color:#c9c6de">
    <header class="sticky top-0 z-10 px-6 py-4 flex justify-between" style="background:rgba(15,18,41,.9);backdrop-filter:blur(8px);border-bottom:1px solid #23274a"><h1 style="font-family:Fraunces,serif;color:#edeaf7;font-size:22px">🌙 Songes</h1><div>{{ user.displayName || 'Rêveur anonyme' }} <button @click="logout">⏻</button></div></header>
    <main class="max-w-xl mx-auto px-4 pt-6">
      <section class="rounded-2xl p-5 mb-8" style="background:#161a38;border:1px solid #262b52"><input v-model="title" placeholder="Le titre de ton songe..." class="w-full bg-transparent outline-none mb-3" style="font-family:Fraunces,serif;color:#edeaf7;font-size:19px"><textarea v-model="body" placeholder="Raconte-le comme il t'apparaît, même en fragments..." rows="3" class="w-full bg-transparent outline-none resize-none mb-4"></textarea><div class="mb-4"><div class="mb-2 uppercase text-xs" style="color:#6e6c8a">Clarté du souvenir</div><div class="flex gap-2"><button v-for="p in PHASES" :key="p.id" class="flex-1 py-2 rounded-lg" :style="{background:phase===p.id?'#2C2A57':'transparent',border:`1px solid ${phase===p.id?'#8B7FD4':'#262B52'}`}" @click="phase=p.id">{{ p.glyph }}</button></div></div><div class="flex flex-wrap gap-2 mb-4"><button v-for="t in TAGS" :key="t.id" class="px-3 py-1 rounded-full text-xs" :style="{background:activeTags.includes(t.id)?'#3A2F1F':'transparent',color:activeTags.includes(t.id)?'#D4A857':'#6E6C8A',border:`1px solid ${activeTags.includes(t.id)?'#D4A857':'#33375C'}`}" @click="toggleTag(t.id)">{{ t.label }}</button></div><button :disabled="!title.trim() || !body.trim() || posting" class="w-full py-2.5 rounded-lg disabled:opacity-40" style="background:#d4a857;color:#10132b" @click="submitDream">✦ Partager ce songe</button></section>
      <div v-if="feedLoading" class="text-center py-16">⟳</div><div v-else-if="!dreams.length" class="text-center py-16">Le carnet est encore vierge.</div>
      <div v-else class="flex flex-col gap-5"><article v-for="d in dreams" :key="d.id" class="rounded-2xl overflow-hidden" style="background:#161a38;border:1px solid #262b52"><div class="p-5"><div class="flex justify-between text-sm" style="color:#8b8aa8"><span>{{ d.authorName }} · {{ timeAgo(d.timestamp) }}</span><span>{{ phaseInfo(d).glyph }}</span></div><h2 class="my-2" style="font-family:Fraunces,serif;color:#edeaf7;font-size:20px">{{ d.title }}</h2><p class="mb-3 whitespace-pre-wrap text-sm">{{ d.body }}</p><div v-if="d.tags?.length" class="flex flex-wrap gap-2 mb-3"><span v-for="tid in d.tags" :key="tid" class="px-2.5 py-0.5 rounded-full text-xs" style="background:#3a2f1f;color:#d4a857">{{ TAGS.find(x=>x.id===tid)?.label }}</span></div><div class="flex gap-4 pt-3" style="border-top:1px solid #23274a"><button :style="{color:resonated(d)?'#8B7FD4':'#6E6C8A'}" @click="toggleResonance(d,user.uid)">☾ J'ai rêvé pareil · {{ d.resonances?.length || 0 }}</button><button style="color:#6e6c8a" @click="openEchoes[d.id]=!openEchoes[d.id]">⟳ Échos · {{ d.echoes?.length || 0 }}</button></div></div><div v-if="openEchoes[d.id]" class="px-5 pb-5" style="background:#12152e"><div v-for="e in d.echoes || []" :key="e.id" class="py-1 text-sm"><span style="color:#8b7fd4">{{ e.authorName }}</span> {{ e.text }}</div><div class="flex gap-2 mt-2"><input v-model="echoDrafts[d.id]" placeholder="Répondre..." class="flex-1 px-3 py-2 rounded-lg" style="background:#1a1e3d;color:#edeaf7;border:1px solid #262b52" @keydown.enter="submitEcho(d)"><button @click="submitEcho(d)">➤</button></div></div></article></div>
    </main>
  </div>
</template>
