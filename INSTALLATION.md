# Connexion du formulaire à Google Sheets

## 1. Créer la feuille et le script

1. Créez une nouvelle feuille Google Sheets.
2. Dans la feuille, ouvrez **Extensions → Apps Script**.
3. Effacez le contenu de `Code.gs`, puis collez le contenu du fichier `Code.gs` fourni.
4. Enregistrez le projet. La feuille `RSVP` et ses colonnes seront créées automatiquement au premier appel.

## 2. Publier l’API

1. Dans Apps Script, cliquez sur **Déployer → Nouveau déploiement**.
2. Choisissez **Application Web**.
3. Dans **Exécuter en tant que**, choisissez **Moi**.
4. Dans **Qui a accès**, choisissez **Tout le monde**.
5. Autorisez le script, terminez le déploiement et copiez l’URL qui se termine par `/exec`.

## 3. Relier le site

1. Ouvrez `beaucens-google-sheets.html` dans un éditeur de texte.
2. Recherchez `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`.
3. Remplacez ce texte par l’URL `/exec` copiée à l’étape précédente, sans enlever les guillemets.
4. Enregistrez puis publiez ce fichier HTML sur votre hébergeur.

## 4. Vérifier

1. Envoyez une réponse de test depuis le formulaire.
2. Vérifiez qu’une ligne apparaît dans l’onglet `RSVP` de Google Sheets.
3. Ouvrez l’espace organisateur depuis un autre navigateur : la réponse doit apparaître.
4. Testez la suppression depuis l’espace organisateur et l’export CSV.

## Important — sécurité

Le mot de passe organisateur reste inclus dans le fichier HTML et protège seulement l’interface. Toute personne ayant l’URL publique de l’API peut techniquement lire ou modifier les réponses. Cette solution convient à un petit formulaire privé, mais pas à des données sensibles. Pour une protection forte, il faut ajouter une vraie authentification côté serveur.
