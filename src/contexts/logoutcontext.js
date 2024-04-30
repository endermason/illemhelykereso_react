import { createContext } from 'react';

const AuthContext = createContext({
  currentUser: null,
  logOut: async () => {},
});

export default AuthContext;
