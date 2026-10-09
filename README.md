# Cartographie des acteurs — Les Pennes-Mirabeau (Data Center Cézanne / Sybilles)

Projet statique prêt pour GitHub Pages. Le moteur visuel est repris **sans altération** de la cartographie Fouju et des versions Dunkerque / Escaudain.

## Deux vues, trois onglets

- `apps/network/` : vue réseau interactive, mêmes forces, tailles calculées, zones de répulsion, trajectoires des liens, zoom, déplacement de nœuds, filtres, panneaux et palette de Fouju.
- `apps/cards/` : grille d'acteurs, filtres, fiches, preuves et relations, avec trois onglets : Cartographie des acteurs, Synthèse des oppositions, Points de vigilance & sources.
- `data/` / `config/` : référentiel JSON commun aux deux interfaces.

## Périmètre des données reprises du code transmis

- **65 nœuds** de réseau, **87 relations** issues du code initial, sans ajout de lien inventé.
- **58 entrées de fiche source**, réparties dans **57 fiches individuelles**. Christel Fayette figure deux fois dans la source : ses deux positions et ses deux éléments de preuve sont conservés dans une seule fiche, sans nœud dupliqué.
- **9 thèmes de synthèse**, **4 points de vigilance**, **9 références de sources**.
- Les **huit groupes du réseau source** sont représentés par la taxonomie de Fouju, complétée de deux collèges pour les institutions/acteurs techniques et le réseau élargi. Les couleurs, dimensionnement et comportements existants restent inchangés.

## Limites de la qualification documentaire

Les formulations des acteurs, les synthèses et les niveaux de certitude sont repris du fichier utilisateur, **sans vérification indépendante**. Les passages intitulés « preuves » sont des résumés, non des citations littérales systématiquement sourcées. Les liens précis entre articles et déclarations ne sont pas fournis : les URL ne sont pas inventées, et restent nulles dans les fichiers de données. Les types de relations sont repris des liens du réseau initial, avec leurs libellés et le statut d'origine.

## Publication GitHub Pages

1. Décompresser cette archive et transférer **le contenu** du dossier à la racine du dépôt GitHub.
2. Dans `Settings → Pages`, sélectionner `Deploy from a branch`, branche `main`, répertoire `/ (root)`.
3. Accéder au site déployé. Les deux interfaces sont situées aux chemins `apps/cards/` et `apps/network/`.

## Tests locaux

```bash
python3 validate.py
python3 -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000`. Le chargement des fichiers JSON ne fonctionne pas par simple double-clic `file://` ; GitHub Pages et un serveur local servent les fichiers correctement.
