import type { Clerk } from "@clerk/clerk-react";

export function openSignInModal(clerk: Clerk, fallbackPath = "/sign-in") {
  if (clerk.loaded) {
    clerk.openSignIn();
    return;
  }
  window.location.assign(fallbackPath);
}

export function openSignUpModal(clerk: Clerk, fallbackPath = "/sign-up") {
  if (clerk.loaded) {
    clerk.openSignUp();
    return;
  }
  window.location.assign(fallbackPath);
}
