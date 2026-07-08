import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut
} from "firebase/auth";
import { auth } from "@/shared/config/firebase.config";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  /**
   * Triggers the Google Auth Popup.
   */
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      throw error;
    }
  },

  /**
   * Sends a Passwordless/Magic Link sign-in link to the user's email.
   */
  sendMagicLink: async (email: string) => {
    const actionCodeSettings = {
      // URL to redirect back to. Must be whitelisted in the Firebase Console.
      url: `${window.location.origin}/login?verifyEmail=true`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email locally to complete the sign-in later
      window.localStorage.setItem("emailForSignIn", email);
      return true;
    } catch (error) {
      console.error("Error sending magic link:", error);
      throw error;
    }
  },

  /**
   * Completes sign-in with the email link.
   */
  completeMagicLinkSignIn: async (email: string, href: string) => {
    try {
      if (isSignInWithEmailLink(auth, href)) {
        let savedEmail = email || window.localStorage.getItem("emailForSignIn");
        
        if (!savedEmail) {
          // Ask user to re-enter email if not found locally
          savedEmail = window.prompt("Please enter your email for verification");
        }

        if (savedEmail) {
          const result = await signInWithEmailLink(auth, savedEmail, href);
          window.localStorage.removeItem("emailForSignIn");
          return result.user;
        }
      }
      return null;
    } catch (error) {
      console.error("Error completing magic link sign-in:", error);
      throw error;
    }
  },

  /**
   * Logs out the current Firebase user.
   */
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  }
};
