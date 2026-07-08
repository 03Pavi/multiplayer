/**
 * Abstraction for Clipboard copying to support both Web and Capacitor environments.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  
  // Future Capacitor clipboard integration:
  // import { Clipboard } from '@capacitor/clipboard';
  // await Clipboard.write({ string: text });

  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
};
