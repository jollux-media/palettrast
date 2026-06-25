import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSchemes,
  useCreateScheme,
  useDeleteScheme,
  getGetSchemesQueryKey,
  setAuthTokenGetter,
} from "@workspace/api-client-react";
import { useAppAuth } from "./auth-context";
import {
  type ColourMap,
  type ColourRole,
  type ColourMode,
  buildSmartColourMap,
  shuffleSmartColourMap,
  FALLBACK_COLOURS,
  DEFAULT_ROLES,
  normalizeHex,
} from "./colour-utils";

type PerModeMaps = Record<ColourMode, ColourMap>;

export interface SavedScheme {
  id: string;
  name: string;
  colours: string[];
  maps: PerModeMaps;
  savedAt: number;
}

interface ColourContextValue {
  colours: string[];
  colourMap: ColourMap;
  mode: ColourMode;
  maps: PerModeMaps;
  savedSchemes: SavedScheme[];
  lockedRoles: Set<ColourRole>;
  isSignedIn: boolean;
  openSchemesSignal: number;
  setColours: (colours: string[]) => void;
  addColour: (hex: string) => void;
  removeColour: (hex: string) => void;
  shuffle: () => void;
  assignRole: (role: ColourRole, hex: string) => void;
  toggleLock: (role: ColourRole) => void;
  toggleMode: () => void;
  saveScheme: (name: string) => Promise<void>;
  loadScheme: (id: string) => void;
  deleteScheme: (id: string) => Promise<void>;
  openSchemesPanel: () => void;
}

const ColourContext = createContext<ColourContextValue | null>(null);

function normalizeMap(map: Partial<ColourMap>, mode: ColourMode): ColourMap {
  const fresh = buildSmartColourMap(FALLBACK_COLOURS, mode);
  return { ...fresh, ...map } as ColourMap;
}

function mapUsesHex(map: ColourMap, hexUpper: string): boolean {
  return Object.values(map).some((value) => value.toUpperCase() === hexUpper);
}

function reassignRemovedHex(
  map: ColourMap,
  removedHexUpper: string,
  smart: ColourMap,
): ColourMap {
  let changed = false;
  let sidebarReassigned = false;
  const next = { ...map };

  for (const role of DEFAULT_ROLES) {
    if (next[role].toUpperCase() === removedHexUpper) {
      next[role] = smart[role];
      changed = true;
      if (role === "sidebar") sidebarReassigned = true;
    }
  }

  if (!changed) return map;
  if (sidebarReassigned) {
    next.navText = smart.navText;
  }
  return next;
}

export function ColourProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAppAuth();

  const [colours, setColoursState] = useState<string[]>(FALLBACK_COLOURS);
  const [mode, setMode] = useState<ColourMode>("dark");
  const [maps, setMaps] = useState<PerModeMaps>({
    dark: buildSmartColourMap(FALLBACK_COLOURS, "dark"),
    light: buildSmartColourMap(FALLBACK_COLOURS, "light"),
  });
  const [lockedRoles, setLockedRoles] = useState<Set<ColourRole>>(new Set());
  const [openSchemesSignal, setOpenSchemesSignal] = useState(0);

  const colourMap = maps[mode];
  const qc = useQueryClient();

  // Sync auth token getter via effect (not during render)
  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(async () => (await getToken()) ?? null);
    } else {
      setAuthTokenGetter(null);
    }
  }, [isSignedIn, getToken]);

  const { data: apiSchemes = [] } = useGetSchemes({
    query: {
      enabled: isSignedIn,
      queryKey: [...getGetSchemesQueryKey(), isSignedIn ? "on" : "off"],
      select: (data) =>
        data.map((s) => ({
          id: s.id,
          name: s.name,
          colours: s.colours as string[],
          maps: s.maps as unknown as PerModeMaps,
          savedAt: new Date(s.savedAt).getTime(),
        })),
    },
  });

  const createMutation = useCreateScheme();
  const deleteMutation = useDeleteScheme();

  const savedSchemes: SavedScheme[] = isSignedIn ? (apiSchemes as SavedScheme[]) : [];

  const setColours = useCallback((newColours: string[]) => {
    setColoursState(newColours);
    const forMap = newColours.length > 0 ? newColours : FALLBACK_COLOURS;
    setMaps({
      dark: buildSmartColourMap(forMap, "dark"),
      light: buildSmartColourMap(forMap, "light"),
    });
  }, []);

  const shuffle = useCallback(() => {
    setMaps((prev) => {
      const newMap = shuffleSmartColourMap(colours, mode);
      const merged = { ...newMap };
      for (const role of lockedRoles) {
        merged[role] = prev[mode][role];
      }
      return { ...prev, [mode]: merged };
    });
  }, [colours, mode, lockedRoles]);

  const addColour = useCallback((newHex: string) => {
    setColoursState((prev) => {
      if (prev.includes(newHex)) return prev;
      return [...prev, newHex];
    });
  }, []);

  const removeColour = useCallback(
    (hex: string) => {
      const hexUpper = normalizeHex(hex).toUpperCase();
      if (colours.length <= 1) return;

      const nextColours = colours.filter((c) => c.toUpperCase() !== hexUpper);
      if (nextColours.length === colours.length) return;

      setColoursState(nextColours);

      const usedInMaps =
        mapUsesHex(maps.dark, hexUpper) || mapUsesHex(maps.light, hexUpper);
      if (!usedInMaps) return;

      const forMap = nextColours.length > 0 ? nextColours : FALLBACK_COLOURS;
      setMaps((prev) => ({
        dark: reassignRemovedHex(
          prev.dark,
          hexUpper,
          buildSmartColourMap(forMap, "dark"),
        ),
        light: reassignRemovedHex(
          prev.light,
          hexUpper,
          buildSmartColourMap(forMap, "light"),
        ),
      }));
    },
    [colours, maps],
  );

  const assignRole = useCallback(
    (role: ColourRole, hex: string) => {
      setMaps((prev) => ({
        ...prev,
        [mode]: { ...prev[mode], [role]: hex },
      }));
    },
    [mode],
  );

  const toggleLock = useCallback((role: ColourRole) => {
    setLockedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const saveScheme = useCallback(
    async (name: string) => {
      if (!isSignedIn) return;
      await createMutation.mutateAsync({
        data: {
          name: name.trim() || "Untitled Scheme",
          colours: [...colours],
          maps: {
            dark: { ...maps.dark } as Record<string, string>,
            light: { ...maps.light } as Record<string, string>,
          },
        },
      });
      await qc.invalidateQueries({ queryKey: getGetSchemesQueryKey() });
    },
    [isSignedIn, colours, maps, createMutation, qc],
  );

  const loadScheme = useCallback(
    (id: string) => {
      const scheme = savedSchemes.find((s) => s.id === id);
      if (!scheme) return;
      setColoursState(scheme.colours);
      setMaps({
        dark: normalizeMap(scheme.maps.dark, "dark"),
        light: normalizeMap(scheme.maps.light, "light"),
      });
    },
    [savedSchemes],
  );

  const deleteScheme = useCallback(
    async (id: string) => {
      if (!isSignedIn) return;
      await deleteMutation.mutateAsync({ id });
      await qc.invalidateQueries({ queryKey: getGetSchemesQueryKey() });
    },
    [isSignedIn, deleteMutation, qc],
  );

  const openSchemesPanel = useCallback(() => {
    setOpenSchemesSignal((n) => n + 1);
  }, []);

  return (
    <ColourContext.Provider
      value={{
        colours,
        colourMap,
        mode,
        maps,
        savedSchemes,
        lockedRoles,
        isSignedIn,
        openSchemesSignal,
        setColours,
        addColour,
        removeColour,
        shuffle,
        assignRole,
        toggleLock,
        toggleMode,
        saveScheme,
        loadScheme,
        deleteScheme,
        openSchemesPanel,
      }}
    >
      {children}
    </ColourContext.Provider>
  );
}

export function useColours(): ColourContextValue {
  const ctx = useContext(ColourContext);
  if (!ctx) throw new Error("useColours must be used inside ColourProvider");
  return ctx;
}
