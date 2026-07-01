# Stratégie de branches : trunk-based sur le fil rouge

## Objectif

Mettre en place le trunk-based development sur le dépôt du fil rouge. À la fin de ce TP, vous savez
protéger la branche `main` sur GitHub (require pull request, require status checks), créer une
branche de vie courte, y porter un petit changement, ouvrir une pull request lisible et la fusionner.
Vous repartez avec une `main` toujours déployable et un réflexe : petites branches, petites PR.

## Contexte

Le fil rouge est notre petite API de tâches en Node.js (Express) avec ses points d'entrée `GET /`,
`GET /tasks`, `POST /tasks` et `GET /tasks/:id`. Au jour 2, on cadre la façon de collaborer sur ce
dépôt avant d'y brancher une chaîne d'intégration. Le trunk-based, c'est une seule branche de
référence (`main`), des branches de fonctionnalité qui vivent moins d'une journée, et une intégration
fréquente. Pas de longues branches `develop` ou `release` qui divergent pendant des semaines.

On suppose que vous avez déjà :

- un dépôt GitHub qui contient le starter-code du fil rouge (poussé lors du TP précédent ou fourni) ;
- un clone local à jour, avec `npm install` déjà passé et `npm test` qui passe au vert.

Vous connaissez déjà Git et GitHub Actions. Ici on ne réapprend pas Git, on l'utilise pour installer
une discipline d'équipe.

## Consignes

### 1. Vérifier le point de départ

On part d'une `main` propre et qui passe. Depuis la racine du dépôt cloné :

```bash
git switch main
git pull --ff-only
npm test
```

Les tests doivent passer. C'est la définition minimale de « main déployable » : à tout instant, ce
qui est sur `main` démarre et passe les tests.

### 2. Protéger main sur GitHub

Sur l'interface GitHub, on empêche de pousser directement sur `main` et on impose la revue par PR.

Cliquez : dépôt > onglet `Settings` > menu de gauche `Branches` > bouton `Add branch ruleset`
(ou `Add classic branch protection rule` selon l'affichage). Puis :

- Dans `Branch name pattern` (ou `Target branches`), saisissez `main`.
- Cochez `Require a pull request before merging`. Effet : plus aucun push direct sur `main`, tout
  passe par une PR. C'est ce qui garantit qu'un changement est relu avant d'atterrir sur le tronc.
- Sous cette option, mettez `Required approvals` à `0` pour ce TP (vous travaillez seul). En équipe,
  on monterait à `1`.
- Cochez `Require status checks to pass before merging`. Effet : la PR ne peut fusionner que si les
  vérifications automatiques sont vertes. La liste des checks est vide pour l'instant (pas encore de
  CI), c'est normal : on la remplira au TP suivant quand GitHub Actions tournera. On câble la règle
  maintenant pour ne pas l'oublier.
- Cochez aussi `Require branches to be up to date before merging` si l'option est proposée : ça
  oblige à rebaser ou mettre à jour la branche avant de fusionner, donc à tester contre la dernière
  `main`.
- Enregistrez avec `Create` (ou `Save changes`).

Pourquoi tout ça : la protection transforme une bonne intention (« on relit avant de merger ») en
règle que l'outil fait respecter. Personne ne peut court-circuiter le tronc, même par accident.

### 3. Créer une branche de vie courte

Une branche = un petit changement, un nom explicite, et on la fusionne dans la journée. On part
toujours d'une `main` à jour :

```bash
git switch main
git pull --ff-only
git switch -c feat/champ-priorité
```

Convention de nommage simple : un préfixe (`feat/`, `fix/`, `chore/`) suivi d'une description courte
en minuscules avec des tirets. Le nom doit dire ce que fait la branche, pas votre prénom ni un
numéro de ticket seul.

### 4. Faire un petit changement

On ajoute un champ `priorité` à une tâche créée, avec une valeur par défaut. Le changement reste
minuscule et lisible : c'est tout l'intérêt.

Dans `src/app.js`, dans le handler `POST /tasks`, modifiez la création de la tâche pour inclure le
champ :

```js
app.post("/tasks", (req, res) => {
  const titre = req.body?.titre;
  if (typeof titre !== "string" || titre.trim() === "") {
    res.status(400).json({ erreur: "titre requis" });
    return;
  }
  const priorité = req.body?.priorité === "haute" ? "haute" : "normale";
  const tache = { id: prochainId++, titre: titre.trim(), priorité, faite: false };
  taches.set(tache.id, tache);
  res.status(201).json(tache);
});
```

Ajoutez un test qui couvre le nouveau champ, à la fin de `test/app.test.js` :

```js
test("POST /tasks applique une priorité par defaut", async () => {
  const res = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ titre: "ranger le bureau" }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.priorité, "normale");
});
```

Vérifiez en local avant de pousser quoi que ce soit :

```bash
npm test
npm run lint
```

Les deux doivent passer. On ne poussé jamais un changement qu'on n'a pas vu passer chez soi.

### 5. Commit et push

Un commit clair, un message qui dit l'intention :

```bash
git add src/app.js test/app.test.js
git commit -m "feat: ajoute un champ priorité aux taches"
git push -u origin feat/champ-priorité
```

Le `-u origin feat/champ-priorité` crée la branche distante et relié votre branche locale à elle.
Les prochains `git push` suffiront sans arguments.

### 6. Ouvrir une PR petite et lisible

La commande `git push` affiche dans le terminal un lien `Create a pull request`. Ouvrez-le, ou
allez sur le dépôt : GitHub propose un bandeau `Compare & pull request`.

- Cible : `base: main` <- `compare: feat/champ-priorité`.
- Titre court et parlant, par exemple `feat: champ priorité sur les taches`.
- Description : deux ou trois phrases. Ce que ça change, pourquoi, comment vous l'avez testé. Pas un
  roman.
- Cliquez `Create pull request`.

Regardez l'onglet `Files changed` : une bonne PR tient en quelques lignes qu'un relecteur lit en
deux minutes. Si votre diff fait des centaines de lignes, c'est le signe qu'il fallait découper.

### 7. Fusionner et nettoyer

Comme la règle exige une PR et que la liste de checks est vide pour l'instant, le bouton de merge est
disponible. Cliquez `Squash and merge` (un seul commit propre sur `main`), confirmez, puis
`Delete branch` : une branche de vie courte ne survit pas à sa PR.

Revenez en local, récupérez la `main` fusionnée et supprimez la branche locale :

```bash
git switch main
git pull --ff-only
git branch -d feat/champ-priorité
```

Vous êtes reparti d'une `main` propre, prêt pour le prochain petit changement.

## Livrable

Vous avez réussi le TP si :

- Une règle de protection existe sur `main` avec `Require a pull request before merging` et
  `Require status checks to pass before merging` cochées (capture d'écran ou lien des settings).
- Un push direct sur `main` est refusé par GitHub (vous pouvez le constater, sans forcer).
- La branche `feat/champ-priorité` a été créée à partir d'une `main` à jour et porte un seul petit
  changement cohérent.
- `npm test` et `npm run lint` passent en local sur la branche avant le push.
- Une pull request a été ouverte, avec un titre clair et une description courte, puis fusionnée dans
  `main`.
- La branche a été supprimée après le merge (à distance et en local).
- Après `git pull --ff-only` sur `main`, le champ `priorité` est présent et `npm test` passe.

## Aide

### Pourquoi le trunk-based

- Une seule branche de référence : `main`. Tout le monde intègre dessus, souvent. Moins une branche
  vit longtemps, moins elle diverge, moins le merge fait mal.
- Branche < 1 jour : si une tâche ne tient pas en une journée, découpez-la. Une grosse fonctionnalité
  se livre en plusieurs petites PR, derrière un drapeau si besoin, pas en une branche de deux
  semaines.
- PR petite = revue rapide et fiable. Un relecteur lit bien 50 lignes, mal 800. Petit diff, moins de
  bugs qui passent.
- Main toujours déployable : c'est la promesse du tronc. À tout moment, on peut partir de `main` pour
  livrer. La protection de branche et les status checks sont là pour tenir cette promesse.

### Commandes Git utiles

```bash
# Voir l'etat et la branche courante
git status
git branch --show-current

# Repartir d'une main a jour avant de creer une branche
git switch main && git pull --ff-only

# Creer puis basculer sur une nouvelle branche
git switch -c feat/ma-branche

# Pousser une nouvelle branche et la relier au distant
git push -u origin feat/ma-branche

# Mettre la branche a jour avec main (si la PR demande "up to date")
git switch feat/ma-branche
git fetch origin
git rebase origin/main

# Supprimer une branche locale deja fusionnee
git branch -d feat/ma-branche
```

### Où cliquer sur GitHub

- Protection de branche : `Settings` > `Branches` > `Add branch ruleset` (ou
  `Add classic branch protection rule`).
- Les deux cases qui comptent ici : `Require a pull request before merging` et
  `Require status checks to pass before merging`.
- Ouvrir une PR : bandeau `Compare & pull request` après un push, ou onglet `Pull requests` >
  `New pull request`.
- Fusionner : bouton `Squash and merge` dans la PR, puis `Delete branch`.

### Pièges et dépannage

- `Updates were rejected` au push sur `main` : c'est voulu, la protection fait son travail. Passez
  par une branche et une PR.
- `git pull` qui crée un commit de merge surprise : utilisez `git pull --ff-only`. S'il refuse, c'est
  que votre `main` locale a divergé ; corrigez avant d'aller plus loin.
- `npm test` qui échoue après le changement : relisez le diff de `src/app.js`. Un champ oublié dans
  l'objet `tache` ou une virgule en trop suffisent à casser.
- `npm run lint` qui râle : ESLint est strict sur les détails (guillemets, points-virgules). Lisez le
  message, il pointe le fichier et la ligne.
- La PR refuse de fusionner alors que tout est vert plus tard (au TP suivant) : vérifiez que la
  branche est à jour avec `main` (`git rebase origin/main` puis `git push --force-with-lease`).
- Status checks « vides » : tant qu'aucun workflow GitHub Actions ne tourne, aucun check n'est listé.
  La règle est posée, elle prendra effet dès que la CI existera. C'est l'objet du prochain TP.