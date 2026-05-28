import React, { createContext, useContext } from "react";

export interface AuthValue {
  hasAuthConfigured: boolean;
  isSignedIn: boolean;
  isLoaded: boolean;
  getToken: () => Promise<string | null>;
}

const defaultAuth: AuthValue = {
  hasAuthConfigured: false,
  isSignedIn: false,
  isLoaded: true,
  getToken: async () => null,
};

export const AuthContext = createContext<AuthValue>(defaultAuth);
export const useAppAuth = () => useContext(AuthContext);
