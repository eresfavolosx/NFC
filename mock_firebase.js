export const auth = {};
export const provider = {};
export const signInWithPopup = async () => ({ user: { uid: '1', email: 'test@example.com', displayName: 'Test', photoURL: '' } });
export const signOut = async () => {};
export const onAuthStateChanged = (auth, cb) => {
  // immediately call with a fake user to bypass login
  setTimeout(() => {
    cb({ uid: '1', email: 'test@example.com', displayName: 'Test User', photoURL: '' });
  }, 100);
};
