import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

export function useAuth() {
  const { $auth, $providers } = useNuxtApp();
  const user = useState('songes-user', () => null);
  const authLoading = useState('songes-auth-loading', () => true);
  const authError = useState('songes-auth-error', () => null);
  const signingIn = useState('songes-signing-in', () => null);

  onAuthStateChanged($auth, (u) => {
    user.value = u;
    authLoading.value = false;
  });

  const login = async (providerId) => {
    authError.value = null;
    signingIn.value = providerId;
    try {
      await signInWithPopup($auth, $providers[providerId]);
    } catch (e) {
      authError.value = "La connexion a échoué. Vérifie que le fournisseur est activé dans Firebase Console.";
    } finally {
      signingIn.value = null;
    }
  };

  const logout = () => signOut($auth);

  return { user, authLoading, authError, signingIn, login, logout };
}
