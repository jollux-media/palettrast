export interface MockupTheme {
  bg: string;
  surface: string;
  sidebar: string;
  primary: string;
  accent: string;
  headingCol: string;
  textCol: string;
  muted: string;
  sidebarText: string;
  primaryText: string;
  accentText: string;
  surfaceText: string;
  bgText: string;
  surfaceBorder: string;
  sidebarBorder: string;
  inputBg: string;
  inputText: string;
  dropdownBg: string;
  dropdownText: string;
  modalBg: string;
  modalText: string;
  withAlpha: (hex: string, alpha: number) => string;
}
