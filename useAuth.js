import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'

export function useAuth() {
  const { $auth, $providers } = useNuxtApp()
  const user = useState('songes-user', () => null)
  const authLoading = useState('songes-auth-loading', () => true)
  const authError = useState('songes-auth-error', () => null)
  const signingIn = useState('songes-signing-in', () => null)

  if (import.meta.client && $auth) {
    onAuthStateChanged($auth, (u) => {
      user.value = u
      authLoading.value = false
    })
  } else if (import.meta.server) {
    authLoading.value = false
  }

  const login = async (providerId) => {
    if (!$auth || !$providers?.[providerId]) return
    authError.value = null
    signingIn.value = providerId
    try {
      await signInWithPopup($auth, $providers[providerId])
    } catch (e) {
      authError.value = "La connexion a échoué. Vérifie que le fournisseur est activé dans Firebase Console."
    } finally {
      signingIn.value = null
    }
  }

  const logout = () => $auth ? signOut($auth) : Promise.resolve()

  return { user, authLoading, authError, signingIn, login, logout }
}
