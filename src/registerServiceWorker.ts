const isProduction = import.meta.env.PROD;

if (isProduction && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.warn("Service Worker konnte nicht registriert werden.", error);
    });
  });
}
