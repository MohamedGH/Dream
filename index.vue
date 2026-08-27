<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useDreams } from '~/composables/useDreams';
import { TAGS, PHASES, SOCIALS, timeAgo } from '~/utils/songes';

const { user, authLoading, authError, signingIn, login, logout } = useAuth();
const { dreams, feedLoading, subscribe, addDream, toggleResonance, addEcho } = useDreams();

let unsubscribe = null;
onMounted(() => {
  unsubscribe = subscribe();
});
onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const title = ref('');
const body = ref('');
const activeTags = ref([]);
const phase = ref(2);
const posting = ref(false);

const openEchoes = ref({});
const echoDrafts = ref({});

function toggleTag(id) {
  activeTags.value = activeTags.value.includes(id)
    ? activeTags.value.filter((t) => t !== id)
    : [...activeTags.value, id];
}

async function submitDream() {
  if (!title.value.trim() || !body.value.trim() || posting.value) return;
  posting.value = true;
  try {
    await addDream(user.value, {
      title: title.value.trim(),
      body: body.value.trim(),
      tags: activeTags.value,
      phase: phase.value,
    });
    title.value = '';
    body.value = '';
    activeTags.value = [];
    phase.value = 2;
  } finally {
    posting.value = false;
  }
}

function phaseInfo(d) {
  return PHASES.find((p) => p.id === d.phase) || PHASES[1];
}

function resonated(d) {
  return (d.resonances || []).includes(user.value?.uid);
}

async function submitEcho(d) {
  const text = (echoDrafts.value[d.id] || '').trim();
  if (!text) return;
  await addEcho(d, user.value, text);
  echoDrafts.value[d.id] = '';
}
</script>

<template>
  <div v-if="authLoading" class="min-h-screen flex items-center justify-center" style="background: #0f1229">
    <div class="animate-spin" style="color: #8b7fd4">⟳</div>
  </div>

  <div v-else-if="!user" class="min-h-screen flex items-center justify-center px-6" style="background: #0f1229">
    <div class="w-full max-w-sm text-center">
      <div class="text-5xl mb-4">🌙</div>
      <h1 class="text-3xl mb-2" style="font-family: Fraunces, serif; color: #edeaf7">Songes</h1>
      <p class="mb-8" style="font-family: Inter, sans-serif; color: #8b8aa8; font-size: 14px">
        Connecte-toi pour déposer et lire les songes du carnet partagé.
      </p>
      <div class="flex flex-col gap-2">
        <button
          v-for="s in SOCIALS"
          :key="s.id"
          :disabled="signingIn !== null"
          class="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
          style="background: #1a1e3d; color: #edeaf7; font-family: Inter, sans-serif; border: 1px solid #33375c"
          @click="login(s.id)"
        >
          {{ signingIn === s.id ? '…' : '' }} Continuer avec {{ s.label }}
        </button>
      </div>
      <p v-if="authError" class="mt-4 text-sm" style="color: #e8a8a8; font-family: Inter, sans-serif">
        {{ authError }}
      </p>
    </div>
  </div>

  <div v-else class="min-h-screen pb-16" style="background: #0f1229">
    <header
      class="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
      style="background: rgba(15,18,41,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid #23274a"
    >
      <div class="flex items-center gap-2">
        <span class="text-xl">🌙</span>
        <h1 style="font-family: Fraunces, serif; color: #edeaf7; font-size: 22px">Songes</h1>
      </div>
      <div class="flex items-center gap-3">
        <span style="font-family: Inter, sans-serif; color: #8b8aa8; font-size: 13px">
          {{ user.displayName || 'Rêveur anonyme' }}
        </span>
        <button style="color: #6e6c8a" title="Se déconnecter" @click="logout">⏻</button>
      </div>
    </header>

    <main class="max-w-xl mx-auto px-4 pt-6">
      <div class="rounded-2xl p-5 mb-8" style="background: #161a38; border: 1px solid #262b52">
        <input
          v-model="title"
          placeholder="Le titre de ton songe..."
          class="w-full bg-transparent outline-none mb-3"
          style="font-family: Fraunces, serif; color: #edeaf7; font-size: 19px"
        />
        <textarea
          v-model="body"
          placeholder="Raconte-le comme il t'apparaît, même en fragments..."
          rows="3"
          class="w-full bg-transparent outline-none resize-none mb-4"
          style="font-family: Inter, sans-serif; color: #c9c6de; font-size: 14px"
        />

        <div class="mb-4">
          <div class="mb-2 uppercase" style="font-family: 'JetBrains Mono', monospace; color: #6e6c8a; font-size: 11px; letter-spacing: 0.05em">
            Clarté du souvenir
          </div>
          <div class="flex gap-2">
            <button
              v-for="p in PHASES"
              :key="p.id"
              :title="p.label"
              class="flex-1 py-2 rounded-lg text-center transition-all"
              :style="{
                background: phase === p.id ? '#2C2A57' : 'transparent',
                border: `1px solid ${phase === p.id ? '#8B7FD4' : '#262B52'}`,
              }"
              @click="phase = p.id"
            >
              <span style="font-size: 16px">{{ p.glyph }}</span>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="t in TAGS"
            :key="t.id"
            class="px-3 py-1 rounded-full text-xs transition-all"
            :style="{
              fontFamily: 'Inter, sans-serif',
              background: activeTags.includes(t.id) ? '#3A2F1F' : 'transparent',
              color: activeTags.includes(t.id) ? '#D4A857' : '#6E6C8A',
              border: `1px solid ${activeTags.includes(t.id) ? '#D4A857' : '#33375C'}`,
            }"
            @click="toggleTag(t.id)"
          >
            {{ t.label }}
          </button>
        </div>

        <button
          :disabled="!title.trim() || !body.trim() || posting"
          class="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
          style="background: #d4a857; color: #10132b; font-family: Inter, sans-serif"
          @click="submitDream"
        >
          ✦ Partager ce songe
        </button>
      </div>

      <div v-if="feedLoading" class="flex justify-center py-16" style="color: #6e6c8a">⟳</div>
      <div v-else-if="dreams.length === 0" class="text-center py-16" style="font-family: Inter, sans-serif; color: #6e6c8a">
        Le carnet est encore vierge. Sois le premier à y déposer un songe.
      </div>

      <div v-else class="flex flex-col gap-5">
        <article
          v-for="d in dreams"
          :key="d.id"
          class="rounded-2xl overflow-hidden"
          style="background: #161a38; border: 1px solid #262b52; box-shadow: 0 0 40px -20px rgba(139,127,212,0.35)"
        >
          <div class="p-5">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2" style="font-family: Inter, sans-serif; font-size: 13px; color: #8b8aa8">
                <span style="color: #c9c6de">{{ d.authorName }}</span>
                <span>·</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px">{{ timeAgo(d.timestamp) }}</span>
              </div>
              <span :title="phaseInfo(d).label" class="text-base">{{ phaseInfo(d).glyph }}</span>
            </div>

            <h2 class="mb-2" style="font-family: Fraunces, serif; color: #edeaf7; font-size: 20px">{{ d.title }}</h2>
            <p class="mb-3 whitespace-pre-wrap" style="font-family: Inter, sans-serif; color: #c9c6de; font-size: 14px; line-height: 1.6">
              {{ d.body }}
            </p>

            <div v-if="d.tags?.length" class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="tid in d.tags"
                :key="tid"
                class="px-2.5 py-0.5 rounded-full text-xs"
                style="background: #3a2f1f; color: #d4a857; font-family: Inter, sans-serif"
              >
                {{ TAGS.find((x) => x.id === tid)?.label }}
              </span>
            </div>

            <div class="flex items-center gap-4 pt-1" style="border-top: 1px solid #23274a">
              <button
                class="flex items-center gap-1.5 pt-3 text-sm transition-colors"
                :style="{ fontFamily: 'Inter, sans-serif', color: resonated(d) ? '#8B7FD4' : '#6E6C8A' }"
                @click="toggleResonance(d, user.uid)"
              >
                ☾ J'ai rêvé pareil{{ (d.resonances || []).length > 0 ? ` · ${d.resonances.length}` : '' }}
              </button>
              <button
                class="flex items-center gap-1.5 pt-3 text-sm"
                style="font-family: Inter, sans-serif; color: #6e6c8a"
                @click="openEchoes[d.id] = !openEchoes[d.id]"
              >
                ⟳ Échos{{ (d.echoes || []).length > 0 ? ` · ${d.echoes.length}` : '' }}
              </button>
            </div>
          </div>

          <div v-if="openEchoes[d.id]" class="px-5 pb-5" style="background: #12152e">
            <div v-if="d.echoes?.length" class="flex flex-col gap-2 mb-3 pt-3">
              <div v-for="e in d.echoes" :key="e.id" style="font-family: Inter, sans-serif; font-size: 13px">
                <span style="color: #8b7fd4">{{ e.authorName }}</span>
                <span style="color: #c9c6de"> {{ e.text }}</span>
              </div>
            </div>
            <div class="flex gap-2 pt-2">
              <input
                v-model="echoDrafts[d.id]"
                placeholder="Répondre à ce songe..."
                class="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
                style="background: #1a1e3d; color: #edeaf7; font-family: Inter, sans-serif; border: 1px solid #262b52"
                @keydown.enter="submitEcho(d)"
              />
              <button class="px-3 rounded-lg" style="background: #262b52; color: #8b7fd4" @click="submitEcho(d)">➤</button>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>
