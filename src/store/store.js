import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const STORAGE_KEY = "hr_portal_auth";

function loadAuthState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return undefined;
        return { auth: { currentUser: JSON.parse(raw) } };
    } catch {
        return undefined;
    }
}

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    preloadedState: loadAuthState(),
});

store.subscribe(() => {
    try {
        const { currentUser } = store.getState().auth;
        if (currentUser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // ignore write errors (private mode, quota)
    }
});

export default store;
