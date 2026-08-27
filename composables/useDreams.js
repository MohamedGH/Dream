import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'

export function useDreams() {
  const { $db } = useNuxtApp()
  const dreams = useState('songes-dreams', () => [])
  const feedLoading = useState('songes-feed-loading', () => true)

  const subscribe = () => {
    const q = query(collection($db, 'dreams'), orderBy('timestamp', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        dreams.value = snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now(),
          }
        })
        feedLoading.value = false
      },
      () => {
        feedLoading.value = false
      }
    )
  }

  const addDream = async (user, { title, body, tags, phase }) => {
    await addDoc(collection($db, 'dreams'), {
      authorUid: user.uid,
      authorName: user.displayName || 'Rêveur anonyme',
      authorPhoto: user.photoURL || null,
      title,
      body,
      tags,
      phase,
      timestamp: serverTimestamp(),
      resonances: [],
      echoes: [],
    })
  }

  const toggleResonance = async (dream, uid) => {
    const has = (dream.resonances || []).includes(uid)
    await updateDoc(doc($db, 'dreams', dream.id), {
      resonances: has ? arrayRemove(uid) : arrayUnion(uid),
    })
  }

  const addEcho = async (dream, user, text) => {
    await updateDoc(doc($db, 'dreams', dream.id), {
      echoes: arrayUnion({
        id: `${Date.now()}-${user.uid}`,
        authorUid: user.uid,
        authorName: user.displayName || 'Rêveur anonyme',
        text,
        timestamp: Date.now(),
      }),
    })
  }

  return { dreams, feedLoading, subscribe, addDream, toggleResonance, addEcho }
}
