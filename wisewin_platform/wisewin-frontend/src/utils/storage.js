// Thin wrapper around localStorage for storing and retrieving the user's session data.
// Using fixed key names here means they're only defined in one place.
const TOKEN_KEY = "wisewin_token";
const USER_KEY = "wisewin_user";

export const storage = {
  getToken() { return localStorage.getItem(TOKEN_KEY); },
  setToken(token) { localStorage.setItem(TOKEN_KEY, token); },
  removeToken() { localStorage.removeItem(TOKEN_KEY); },

  // User is stored as JSON since localStorage only holds strings
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); },
  removeUser() { localStorage.removeItem(USER_KEY); },

  // Wipes both token and user — called on logout or when a 401 is received
  clear() {
    this.removeToken();
    this.removeUser();
  },
};
