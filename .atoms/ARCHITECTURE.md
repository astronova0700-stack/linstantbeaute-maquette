# Architecture Design

## System Overview
Site vitrine one-page statique pour institut de beauté. Aucun backend, aucune dépendance serveur. Dossier autonome déployable sur GitHub Pages.

## Tech Stack
- HTML5 sémantique
- CSS3 (variables custom, grid, flexbox, animations)
- JavaScript vanilla (ES5+ compatible)
- Google Fonts (Cormorant Garamond + Montserrat)

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Structure | Contenu et sections de la page | index.html |
| Style | Direction artistique et responsive | style.css |
| Interactions | Carrousel, menu, scroll reveal | script.js |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Aucun (vanilla) | Brief exige zéro dépendance serveur |
| CSS | Custom properties + media queries | Léger, maintenable, pas de build |
| Carousel | JS vanilla, plat, sans boucle | Brief interdit 3D et infinite loop |
| Images | CDN (mgx-backend-cdn) | Générées par IA, optimisées |

## File Tree Plan
```
linstantbeaute-x7m9/
├── index.html
├── style.css
└── script.js
```

## Implementation Guide
1. index.html contient toute la structure one-page avec navigation par ancres
2. style.css gère la DA complète (palette poudrée, typo serif/sans, responsive 360/768/1440)
3. script.js gère le carrousel d'avis (plat, sans boucle), le menu mobile, le scroll reveal