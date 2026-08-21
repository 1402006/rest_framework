// URL de l'API Django réelle. En dev, on déduit l'hôte de celui utilisé pour
// charger la page (localhost ou IP locale), pour pouvoir tester depuis un
// téléphone sur le même réseau sans rien changer à la main.
export const API_BASE_URL = `http://${window.location.hostname}:8000/api`;
