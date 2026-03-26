# Bouture.app — PRD V2 : Échanges & Collection

**Version :** 2.0  
**Date :** 26 mars 2026  
**Statut :** Draft  
**Auteur :** Product & Engineering Team  
**Dépendances :** PRD V1 (docs/PRD.md), schema `init_schema.sql`

---

## Table des matières

1. [Introduction & Objectifs](#1-introduction--objectifs)
2. [User Flows détaillés](#2-user-flows-détaillés)
   - 2.1 [Collection : navigation & découverte](#21-collection--navigation--découverte)
   - 2.2 [Flux Donner : passage par la Collection](#22-flux-donner--passage-par-la-collection)
   - 2.3 [Découverte inversée : "Chercher sur la carte"](#23-découverte-inversée--chercher-sur-la-carte)
   - 2.4 [Proposer un échange](#24-proposer-un-échange)
   - 2.5 [Double confirmation & récompense](#25-double-confirmation--récompense)
   - 2.6 [Galerie Fullscreen (Lightbox)](#26-galerie-fullscreen-lightbox)
3. [Changements de Base de Données](#3-changements-de-base-de-données)
   - 3.1 [Nouveaux ENUMs](#31-nouveaux-enums)
   - 3.2 [Modifications de la table `listings`](#32-modifications-de-la-table-listings)
   - 3.3 [Nouvelle table `transactions`](#33-nouvelle-table-transactions)
   - 3.4 [Modifications de la table `plant_library`](#34-modifications-de-la-table-plant_library)
   - 3.5 [Politiques RLS](#35-politiques-rls)
   - 3.6 [Fonctions & Triggers](#36-fonctions--triggers)
4. [Architecture UI/UX & Animations](#4-architecture-uiux--animations)
   - 4.1 [Bottom Navbar V2](#41-bottom-navbar-v2)
   - 4.2 [Page Collection (refonte)](#42-page-collection-refonte)
   - 4.3 [Modale de proposition d'échange](#43-modale-de-proposition-déchange)
   - 4.4 [Écran de transaction & double confirmation](#44-écran-de-transaction--double-confirmation)
   - 4.5 [Animation "Wow" — plante → Collection](#45-animation-wow--plante--collection)
   - 4.6 [Filtres Map V2 : recherche par espèce](#46-filtres-map-v2--recherche-par-espèce)
   - 4.7 [Galerie Fullscreen (Lightbox Apple-like)](#47-galerie-fullscreen-lightbox-apple-like)
5. [Plan d'Implémentation](#5-plan-dimplémentation)

---

## 1. Introduction & Objectifs

### 1.1 Contexte

Bouture.app V1 est en production. Les utilisateurs peuvent publier des dons de plantes, les découvrir sur une carte interactive (MapLibre/MapTiler), échanger via messagerie temps réel (Supabase Realtime), et gérer une bibliothèque personnelle de plantes ("Pokédex").

La V1 a validé le modèle de don gratuit. Les retours utilisateurs révèlent trois axes d'amélioration prioritaires :

1. **L'échange entre utilisateurs** — Au-delà du don unilatéral, les utilisateurs souhaitent troquer des plantes entre eux.
2. **La Collection comme moteur d'engagement** — La bibliothèque est sous-exploitée ; elle doit devenir le cœur de la boucle de rétention.
3. **La sécurisation des transactions** — Aucun suivi formel des échanges n'existe ; les confirmations se perdent dans la messagerie.

### 1.2 Objectifs V2

| Objectif | Métrique cible | Horizon |
|----------|---------------|---------|
| Augmenter la rétention J7 | +25% | 3 mois post-launch |
| Taux de complétion de transaction | >70% des transactions initiées | 3 mois |
| Engagement Collection | >50% des utilisateurs actifs consultent leur Collection/semaine | 6 mois |
| Échanges actifs | >30% des transactions sont des échanges (vs dons purs) | 6 mois |

### 1.3 Principes directeurs

- **Collection-first** — Toute interaction revient vers la Collection. Donner une plante commence par la posséder dans sa Collection ; recevoir une plante la complète.
- **Confiance par la structure** — La double confirmation remplace le "Ok j'ai reçu" informel dans le chat.
- **Dopamine loops** — Chaque plante reçue déclenche une animation de récompense. La Collection se remplit visuellement.
- **Zero friction** — Les nouveaux flux s'intègrent dans l'existant sans rupture UX. Le design system (sauge `#4A6741` / terracotta `#C67B5C`) reste la base.

---

## 2. User Flows détaillés

### 2.1 Collection : navigation & découverte

**Changement structurel :** La Collection passe de `/profil/bibliotheque` (sous-page du profil) à un onglet principal de la Bottom Navbar.

**Route :** `/collection` (nouvelle route de premier niveau)

**Flow :**

```
[Bottom Navbar : Carte | Collection | Donner | Messages | Profil]
                          ↓
              /collection (grille d'espèces)
             ┌──────────────┬──────────────┐
             │  Possédée ✓  │  Non possédée│
             │  (couleur)   │  (grisée 40%)│
             └──────┬───────┴──────┬───────┘
                    ↓              ↓
         /collection/[plantId]   Overlay espèce
         (détail plante perso)   ┌────────────────────┐
         → "Proposer en don"     │ Illustration + nom  │
                                 │ [Chercher sur carte] │
                                 │ [Ajouter manuellement]│
                                 └────────────────────┘
```

**Étapes détaillées :**

1. L'utilisateur tape sur l'onglet "Collection" dans la Bottom Navbar.
2. La page `/collection` s'affiche avec la grille d'espèces (reprise de l'actuel `/profil/bibliotheque`).
3. **Espèce possédée** (carte couleur, photo de l'utilisateur ou illustration) → tap → `/collection/[plantId]` (détail de la plante dans sa collection personnelle).
4. **Espèce non possédée** (carte grisée à 40% d'opacité, illustration en fond) → tap → overlay bottom sheet avec :
   - Illustration de l'espèce (depuis `species.illustration_url`)
   - Nom commun + nom scientifique
   - Bouton primaire : **"Chercher sur la carte"** → redirige vers `/carte?speciesId={species.id}&speciesName={species.common_name}`
   - Bouton secondaire : **"Ajouter manuellement"** → redirige vers `/collection/ajouter?speciesId={species.id}` (pré-rempli)

### 2.2 Flux Donner : passage par la Collection

**Changement :** L'utilisateur doit posséder la plante dans sa Collection pour la publier en don/échange. Cela enrichit la Collection et garantit la cohérence des données.

**Route :** `/donner` (inchangée, logique conditionnelle ajoutée)

**Flow :**

```
/donner
  ↓
Utilisateur a-t-il des plantes "collection" dans plant_library ?
  ├── OUI → Sélecteur de plante (grille des plantes status=collection)
  │         → Sélection → formulaire pré-rempli (espèce, photos)
  │         → Publication → plant_library.status → "for_donation"
  │
  └── NON → Écran "Votre Collection est vide"
            → [Ajouter une plante à ma Collection] → /collection/ajouter
            → Retour automatique à /donner après ajout
```

**Étapes détaillées :**

1. L'utilisateur tape "Donner" dans la Bottom Navbar.
2. **Check :** requête `plant_library` WHERE `user_id = auth.uid() AND status = 'collection'`.
3. **Si résultats > 0 :** affichage d'une grille scrollable horizontale de ses plantes disponibles. Tap sur une plante → formulaire `/donner` pré-rempli avec `species_name`, `species_id`, photos de la plant_library. L'utilisateur complète : taille, description, localisation, **type de transaction** (nouveau).
4. **Si résultats = 0 :** écran vide avec illustration (Sprout), message "Ajoutez d'abord une plante à votre Collection", CTA vers `/collection/ajouter`. Après ajout, `router.push('/donner')` avec la nouvelle plante sélectionnable.
5. **Paramètre existant conservé :** `?plantId=` continue de fonctionner (deeplink depuis `/collection/[plantId]`).
6. **Mode édition conservé :** `?edit=` fonctionne comme avant.

### 2.3 Découverte inversée : "Chercher sur la carte"

**Flow :**

```
/collection (grille)
  → Tap espèce non possédée
  → Bottom sheet info espèce
  → [Chercher sur la carte]
  → /carte?speciesId=42&speciesName=Monstera+deliciosa
  → FilterSheet auto-ouvert avec filtre espèce pré-actif
  → Seuls les pins de cette espèce sont visibles
```

**Étapes détaillées :**

1. Depuis la Collection, l'utilisateur tape sur une espèce grisée.
2. Un bottom sheet apparaît (spring animation, pattern existant `filter-sheet.tsx`).
3. Bouton "Chercher sur la carte" → `router.push('/carte?speciesId=42&speciesName=Monstera deliciosa')`.
4. La page `/carte` lit les query params au mount.
5. Le `map-store` applique automatiquement `filters.speciesId = 42`.
6. Le `FilterSheet` affiche un chip actif avec le nom de l'espèce et un `X` pour retirer le filtre.
7. La fonction RPC `get_listings_in_bounds` filtre par `species_id` (paramètre à ajouter).
8. Seuls les pins correspondants apparaissent.

### 2.4 Proposer un échange

**Prérequis :** L'annonce consultée a `transaction_type` = `echange_uniquement` ou `les_deux`.

**Flow :**

```
/carte/[listingId] (détail annonce)
  ↓
Badge "Échange possible" visible
  ↓
[Contacter] → conversation classique (don)
[Proposer un échange] → Modale de sélection
  ↓
Modale : grille des annonces actives de l'utilisateur
  → Sélection d'une annonce à proposer
  → Confirmation "Proposer cet échange ?"
  → INSERT INTO transactions (status: pending)
  → Notification push au donneur
  → Redirect vers /messages/[conversationId] avec context card "Échange proposé"
```

**Étapes détaillées :**

1. Sur `/carte/[listingId]`, si `listing.transaction_type ∈ ['echange_uniquement', 'les_deux']`, un badge "Échange accepté" (terracotta `bg-accent/10 text-accent`) est affiché sous le titre.
2. Deux CTA apparaissent :
   - **"Contacter"** (existant, flux don classique) — visible uniquement si `transaction_type ∈ ['don_uniquement', 'les_deux']`
   - **"Proposer un échange"** (nouveau, bouton accent) — visible si `transaction_type ∈ ['echange_uniquement', 'les_deux']`
3. Tap "Proposer un échange" → ouverture d'une modale fullscreen (Framer Motion, `layoutId` transition).
4. La modale affiche les annonces actives de l'utilisateur connecté (`listings WHERE donor_id = auth.uid() AND is_active = true`).
5. L'utilisateur sélectionne une annonce → écran de confirmation avec les deux annonces côte à côte (visuellement, un "VS" au centre).
6. Confirmation → `INSERT INTO transactions` avec `status = 'pending'`.
7. Création/récupération de la conversation (`get_or_create_conversation`).
8. Message système automatique dans la conversation : "🔄 {username} propose un échange : {species_name} contre {species_name}".
9. Notification Web Push au donneur de l'annonce initiale.
10. Redirect vers `/messages/[conversationId]`.

### 2.5 Double confirmation & récompense

**Flow complet d'une transaction (don ou échange) :**

```
Transaction créée (status: pending)
  ↓
Donneur accepte → status: accepted
  OU
Donneur refuse → status: rejected (fin)
  ↓
[Rencontre physique entre les deux utilisateurs]
  ↓
Donneur confirme "Plante donnée" → status: giver_confirmed
  ↓
Receveur confirme "Plante reçue" → status: receiver_confirmed
  ↓
(Si échange : les deux confirment dans les deux sens)
  ↓
Toutes confirmations reçues → status: completed
  ↓
Trigger automatique :
  1. INSERT plant_library (receveur) — plante ajoutée à la Collection
  2. UPDATE plant_library (donneur) → status = 'donated'
  3. UPDATE listings → is_active = false
  4. Notification Web Push au receveur : "🌱 Nouvelle plante dans votre Collection !"
  5. Animation "Wow" côté client
```

**Étapes détaillées (perspective receveur) :**

1. Le receveur reçoit une notification "Échange accepté !" (ou "Don accepté !").
2. Dans la conversation, un `ContextCard` mis à jour affiche le statut de la transaction et les boutons d'action.
3. Après la rencontre physique, le donneur tape **"Plante donnée"** → `UPDATE transactions SET status = 'giver_confirmed'`.
4. Le receveur voit apparaître un bouton **"Confirmer la réception"** dans la conversation.
5. Tap → `UPDATE transactions SET status = 'completed'` (la fonction vérifie que `giver_confirmed` est déjà passé).
6. **Instantanément :**
   - L'animation "Wow" se déclenche (cf. §4.5).
   - La plante est ajoutée à sa Collection (trigger SQL ou Edge Function).
   - Notification push : "🌱 {species_name} ajoutée à votre Collection !"

**Cas échange (bidirectionnel) :**

Pour un échange, deux transactions "miroir" sont créées (ou une transaction avec deux lignes de confirmation). Chaque partie doit confirmer l'envoi ET la réception de sa plante respective. Le statut `completed` n'est atteint que lorsque les 4 confirmations sont reçues (2 × giver_confirmed + 2 × receiver_confirmed).

### 2.6 Galerie Fullscreen (Lightbox)

**Flow :**

```
/carte/[listingId]
  → Tap sur photo dans le carrousel
  → Transition layoutId (image s'étend vers plein écran)
  → Fond noir 95% opacité
  → Pinch-to-zoom + pan
  → Swipe horizontal : photo suivante/précédente
  → Swipe vertical vers le bas : fermeture (spring physics)
  → L'image revient à sa position initiale (layoutId reverse)
```

---

## 3. Changements de Base de Données

### 3.1 Nouveaux ENUMs

```sql
-- Type de transaction proposé par le donneur sur son annonce
CREATE TYPE transaction_type AS ENUM (
  'don_uniquement',
  'echange_uniquement',
  'les_deux'
);

-- Statut d'une transaction entre deux utilisateurs
CREATE TYPE transaction_status AS ENUM (
  'pending',        -- Proposition envoyée, en attente de réponse
  'accepted',       -- Le donneur a accepté
  'rejected',       -- Le donneur a refusé
  'cancelled',      -- Annulée par le proposeur
  'giver_confirmed',    -- Le donneur confirme avoir donné la plante
  'receiver_confirmed', -- Le receveur confirme avoir reçu (mais donneur pas encore confirmé)
  'completed'       -- Les deux parties ont confirmé — transaction terminée
);
```

### 3.2 Modifications de la table `listings`

```sql
ALTER TABLE listings
  ADD COLUMN transaction_type transaction_type NOT NULL DEFAULT 'don_uniquement';

COMMENT ON COLUMN listings.transaction_type IS
  'Détermine si l annonce accepte les dons, les échanges, ou les deux.';
```

**Impact TypeScript (`database.types.ts`) :**

```typescript
// Ajout dans Database["public"]["Enums"]
transaction_type: 'don_uniquement' | 'echange_uniquement' | 'les_deux'
transaction_status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'giver_confirmed' | 'receiver_confirmed' | 'completed'

// Ajout dans Tables["listings"]["Row"]
transaction_type: Database["public"]["Enums"]["transaction_type"]
```

**Impact `ListingInBounds` (`src/lib/types/listing.ts`) :**

```typescript
export interface ListingInBounds {
  // ... champs existants ...
  transaction_type: Database["public"]["Enums"]["transaction_type"];
}
```

### 3.3 Nouvelle table `transactions`

```sql
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  giver_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Annonces liées
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  offered_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    -- NULL pour un don pur ; rempli pour un échange

  -- Conversation associée
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,

  -- Statut
  status          transaction_status NOT NULL DEFAULT 'pending',

  -- Timestamps de confirmation
  giver_confirmed_at  TIMESTAMPTZ,
  receiver_confirmed_at TIMESTAMPTZ,

  -- Métadonnées
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT different_participants CHECK (giver_id <> receiver_id),
  CONSTRAINT valid_exchange CHECK (
    offered_listing_id IS NULL
    OR offered_listing_id <> listing_id
  )
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_transactions_giver ON transactions(giver_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_transactions_listing ON transactions(listing_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_conversation ON transactions(conversation_id);

-- Trigger updated_at
CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
```

**Diagramme des relations :**

```
profiles ──┐
           ├── giver_id ──→ transactions ←── receiver_id ──┤
profiles ──┘                     │                          └── profiles
                                 │
                    listing_id ──┼──→ listings
                                 │
              offered_listing_id ┼──→ listings (nullable)
                                 │
               conversation_id ──┼──→ conversations
```

### 3.4 Modifications de la table `plant_library`

Aucune modification de schéma nécessaire. La table `plant_library` supporte déjà le flux :

- `status = 'collection'` → plante dans la Collection
- `status = 'for_donation'` → plante liée à une annonce active
- `status = 'donated'` → plante donnée (historique)

**Nouvelle logique (trigger) :** Au passage d'une `transaction` à `completed`, un trigger insère automatiquement une entrée `plant_library` pour le receveur avec `status = 'collection'`.

### 3.5 Politiques RLS

```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Lecture : les deux participants peuvent voir leurs transactions
CREATE POLICY "Participants can view their transactions"
  ON transactions FOR SELECT
  USING (auth.uid() IN (giver_id, receiver_id));

-- Création : le receiver crée la transaction (il propose)
CREATE POLICY "Authenticated users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    auth.uid() = receiver_id
    AND status = 'pending'
  );

-- Mise à jour : selon le statut et le rôle
CREATE POLICY "Giver can accept or reject pending transactions"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = giver_id
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('accepted', 'rejected')
  );

CREATE POLICY "Receiver can cancel pending transactions"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = receiver_id
    AND status = 'pending'
  )
  WITH CHECK (
    status = 'cancelled'
  );

CREATE POLICY "Giver can confirm giving"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = giver_id
    AND status = 'accepted'
  )
  WITH CHECK (
    status = 'giver_confirmed'
  );

CREATE POLICY "Receiver can confirm receiving after giver"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = receiver_id
    AND status = 'giver_confirmed'
  )
  WITH CHECK (
    status = 'completed'
  );

-- Note : la politique "receiver_confirmed" (receveur confirme avant le donneur)
-- est gérée symétriquement si besoin. Voir la fonction handle_transaction_completion.
```

### 3.6 Fonctions & Triggers

#### Complétion automatique de transaction

```sql
CREATE OR REPLACE FUNCTION handle_transaction_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_listing RECORD;
  v_offered RECORD;
BEGIN
  -- Ne s'exécute que lors du passage à 'completed'
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Mettre à jour les timestamps
  NEW.receiver_confirmed_at := NOW();

  -- Récupérer l'annonce principale
  SELECT species_name, species_id, photos
    INTO v_listing
    FROM listings WHERE id = NEW.listing_id;

  -- Ajouter la plante à la Collection du receveur
  INSERT INTO plant_library (user_id, species_name, species_id, photos, status, notes)
  VALUES (
    NEW.receiver_id,
    v_listing.species_name,
    v_listing.species_id,
    ARRAY[v_listing.photos[1]], -- première photo comme référence
    'collection',
    'Reçue via échange sur bouture.app'
  )
  ON CONFLICT DO NOTHING;

  -- Désactiver l'annonce principale
  UPDATE listings SET is_active = false WHERE id = NEW.listing_id;

  -- Si c'est un échange, traiter l'annonce offerte
  IF NEW.offered_listing_id IS NOT NULL THEN
    SELECT species_name, species_id, photos
      INTO v_offered
      FROM listings WHERE id = NEW.offered_listing_id;

    -- Ajouter la plante offerte à la Collection du donneur
    INSERT INTO plant_library (user_id, species_name, species_id, photos, status, notes)
    VALUES (
      NEW.giver_id,
      v_offered.species_name,
      v_offered.species_id,
      ARRAY[v_offered.photos[1]],
      'collection',
      'Reçue via échange sur bouture.app'
    )
    ON CONFLICT DO NOTHING;

    -- Désactiver l'annonce offerte
    UPDATE listings SET is_active = false WHERE id = NEW.offered_listing_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_completed
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transaction_completion();
```

#### Modification de `get_listings_in_bounds` (filtre par espèce)

```sql
-- Ajouter le paramètre p_species_id à la signature existante
CREATE OR REPLACE FUNCTION get_listings_in_bounds(
  p_north   DOUBLE PRECISION,
  p_south   DOUBLE PRECISION,
  p_east    DOUBLE PRECISION,
  p_west    DOUBLE PRECISION,
  p_species_id INT DEFAULT NULL  -- NOUVEAU
)
RETURNS TABLE (
  id            UUID,
  donor_id      UUID,
  species_name  TEXT,
  size          listing_size,
  description   TEXT,
  photos        TEXT[],
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  address_city  TEXT,
  donor_username TEXT,
  donor_avatar  TEXT,
  created_at    TIMESTAMPTZ,
  transaction_type transaction_type  -- NOUVEAU
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id, l.donor_id, l.species_name, l.size, l.description, l.photos,
    ST_Y(l.location_public::geometry) AS lat,
    ST_X(l.location_public::geometry) AS lng,
    l.address_city,
    p.username AS donor_username,
    p.avatar_url AS donor_avatar,
    l.created_at,
    l.transaction_type
  FROM listings l
  JOIN profiles p ON p.id = l.donor_id
  WHERE l.is_active = true
    AND ST_Intersects(
      l.location_public,
      ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)::geography
    )
    AND (p_species_id IS NULL OR l.species_id = p_species_id)
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

#### Notification push à la complétion

```sql
-- Trigger pour envoyer une notification push lors de la complétion
CREATE OR REPLACE FUNCTION notify_transaction_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.edge_function_url') || '/push-notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'transaction_completed',
        'receiver_id', NEW.receiver_id,
        'giver_id', NEW.giver_id,
        'listing_id', NEW.listing_id,
        'transaction_id', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_completed_notify
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_transaction_completion();
```

---

## 4. Architecture UI/UX & Animations

### 4.1 Bottom Navbar V2

**Fichier :** `src/components/layout/bottom-nav.tsx`

**Changement :** 4 onglets → 5 onglets. Ajout de "Collection" entre "Carte" et "Donner".

| Position | Label | Route | Icône (lucide-react) | Badge |
|----------|-------|-------|---------------------|-------|
| 1 | Carte | `/carte` | `MapPin` | — |
| 2 | Collection | `/collection` | `BookOpen` | Compteur de nouvelles plantes (optionnel) |
| 3 | Donner | `/donner` | `PlusCircle` | — |
| 4 | Messages | `/messages` | `MessageCircle` | Unread count (existant) |
| 5 | Profil | `/profil` | `User` | — |

**Implémentation :**

```typescript
// src/components/layout/bottom-nav.tsx
import { MapPin, BookOpen, PlusCircle, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/carte", label: "Carte", icon: MapPin },
  { href: "/collection", label: "Collection", icon: BookOpen },
  { href: "/donner", label: "Donner", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
] as const;
```

**Design :** Les 5 onglets se répartissent en `flex-1`. Sur les écrans ≤ 360px, le label passe à `text-[10px]` pour éviter tout débordement. L'icône Collection reçoit un `id="collection-icon"` pour servir de cible à l'animation "Wow" (cf. §4.5).

**AppShell (`src/components/layout/app-shell.tsx`) :** Ajouter `/collection/` aux patterns qui masquent la navbar (pages de détail).

### 4.2 Page Collection (refonte)

**Route :** `/collection` (nouveau) — remplace `/profil/bibliotheque`

**Redirect :** `/profil/bibliotheque` → redirect 301 vers `/collection` (pour les liens existants et le SEO).

**Structure de la page :**

```
┌─────────────────────────────────┐
│  Collection           [🔍 search]│
│  42/156 espèces collectionnées   │
├─────────────────────────────────┤
│  [Toutes] [Possédées] [Manquantes]│  ← Tabs de filtre
├─────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ 🌿  │ │ 🌵  │ │░░░░░│       │
│  │Monst.│ │Echev.│ │Ficus│       │  ← Grille 3 colonnes
│  │  ✓   │ │  ✓   │ │  ?  │       │
│  └─────┘ └─────┘ └─────┘       │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │░░░░░│ │ 🌱  │ │░░░░░│       │
│  │Pothos│ │Calat.│ │Aloe │       │
│  │  ?   │ │  ✓   │ │  ?  │       │
│  └─────┘ └─────┘ └─────┘       │
│         ↕ scroll infini          │
└─────────────────────────────────┘
```

**Comportement des tabs :**

| Tab | Filtre | Tri |
|-----|--------|-----|
| Toutes | Aucun filtre | Possédées en haut, puis alpha |
| Possédées | `ownedIds.has(species.id) === true` | Date d'ajout (récent → ancien) |
| Manquantes | `ownedIds.has(species.id) === false` | Alphabétique |

**Carte d'espèce non possédée :** Opacité 40%, fond `bg-neutral-100`, illustration en grayscale via `filter: grayscale(100%)` + `opacity: 0.4`. Icône `?` centrée.

**Animation d'entrée :** Staggered fade-in avec Framer Motion `variants` sur la grille :

```typescript
const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};
```

### 4.3 Modale de proposition d'échange

**Fichier :** `src/components/listing/exchange-proposal-modal.tsx` (nouveau)

**Trigger :** Bouton "Proposer un échange" sur `/carte/[listingId]` (visible si `transaction_type ∈ ['echange_uniquement', 'les_deux']`).

**Structure :**

```
┌─────────────────────────────────┐
│  ← Proposer un échange          │
├─────────────────────────────────┤
│                                 │
│  Vous proposez...               │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [photo] Monstera        │ ←  │  Annonce cible (lecture seule)
│  │         Taille M        │    │
│  └─────────────────────────┘    │
│                                 │
│       ⇅  en échange de          │
│                                 │
│  Choisissez parmi vos annonces :│
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │photo │ │photo │ │photo │    │  ← Scroll horizontal
│  │Calath│ │Pothos│ │Ficus │    │     annonces actives
│  │ Sel. │ │      │ │      │    │     de l'utilisateur
│  └──────┘ └──────┘ └──────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Proposer cet échange   │    │  ← CTA (disabled tant que
│  └─────────────────────────┘    │     aucune sélection)
│                                 │
└─────────────────────────────────┘
```

**Animation :** La modale entre par le bas en plein écran (`y: "100%" → y: 0`) avec le spring standard `{ stiffness: 300, damping: 30 }`. Fermeture par swipe vers le bas (seuil 100px) ou bouton retour.

**États :**
- `loading` : skeleton des annonces
- `empty` : "Vous n'avez aucune annonce active. Publiez d'abord une plante."
- `selected` : annonce entourée d'un ring `ring-2 ring-primary`, check vert

### 4.4 Écran de transaction & double confirmation

**Emplacement :** Intégré dans la vue de conversation (`src/components/chat/`) via un composant `TransactionCard` enrichi.

**Fichier :** `src/components/chat/transaction-card.tsx` (nouveau, remplace/étend `context-card.tsx` pour les transactions)

**États visuels :**

| Statut | Vue donneur | Vue receveur |
|--------|------------|-------------|
| `pending` | "Nouvelle proposition" + [Accepter] [Refuser] | "Proposition envoyée" + [Annuler] |
| `accepted` | "Échange accepté ✓" + [Plante donnée] | "Échange accepté ✓ — Organisez la remise" |
| `giver_confirmed` | "En attente de confirmation" | "Le donneur a confirmé" + [Plante reçue] |
| `completed` | "Échange terminé 🌱" | "Échange terminé 🌱" + Animation |
| `rejected` | "Vous avez refusé" | "Proposition refusée" |
| `cancelled` | "Proposition annulée" | "Vous avez annulé" |

**Design du `TransactionCard` :**

```
┌────────────────────────────────────┐
│  🔄 Échange proposé               │
│                                    │
│  ┌──────────┐  ⇄  ┌──────────┐   │
│  │  [photo]  │     │  [photo]  │   │
│  │ Monstera  │     │ Calathea  │   │
│  │  @alice   │     │   @bob    │   │
│  └──────────┘     └──────────┘   │
│                                    │
│  Statut : En attente               │
│                                    │
│  [   Accepter   ] [  Refuser  ]    │
└────────────────────────────────────┘
```

**Couleurs par statut :**
- `pending` : `bg-warning/10 border-warning/30`
- `accepted` : `bg-primary/10 border-primary/30`
- `giver_confirmed` : `bg-primary/10 border-primary/30`
- `completed` : `bg-success/10 border-success/30`
- `rejected` / `cancelled` : `bg-neutral-100 border-neutral-300/50`

### 4.5 Animation "Wow" — plante → Collection

L'animation signature de la V2. Au moment où le receveur confirme la réception d'une plante, une animation de "capture" se déclenche.

**Trigger :** Transition vers `status = 'completed'` (réponse serveur réussie).

**Fichier :** `src/components/animations/plant-capture-animation.tsx` (nouveau)

**Spécification technique Framer Motion :**

```typescript
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/*
 * L'animation se décompose en 4 phases :
 *
 * Phase 1 — Apparition (0 → 300ms)
 *   La photo de la plante (thumbnail 64x64) apparaît au centre de l'écran
 *   avec un scale de 0 → 1.2 → 1 (overshoot spring).
 *   Un cercle de particules vertes éclate autour (confetti burst).
 *
 * Phase 2 — Flottement (300ms → 800ms)
 *   La plante "flotte" avec un léger mouvement sinusoïdal vertical
 *   (y oscillation ±8px, rotation ±5°). Simule l'apesanteur.
 *
 * Phase 3 — Vol vers la cible (800ms → 1400ms)
 *   La plante se déplace vers l'icône Collection dans la Bottom Navbar.
 *   Trajectoire : courbe de Bézier (arc naturel, pas ligne droite).
 *   Scale : 1 → 0.3 progressif.
 *   Spring config : { stiffness: 120, damping: 14 } (rebond naturel).
 *
 * Phase 4 — Impact (1400ms → 1800ms)
 *   La plante "plonge" dans l'icône Collection (scale → 0, opacity → 0).
 *   L'icône Collection réagit :
 *     - Scale bounce : 1 → 1.4 → 1 (spring stiffness: 400, damping: 10)
 *     - Flash de couleur : l'icône passe brièvement en accent (#C67B5C)
 *       puis revient à primary (#4A6741)
 *     - Micro particules vertes qui éclatent depuis l'icône
 */

interface PlantCaptureAnimationProps {
  plantImageUrl: string;
  onComplete: () => void;
}

export function PlantCaptureAnimation({
  plantImageUrl,
  onComplete,
}: PlantCaptureAnimationProps) {
  // Récupérer la position de l'icône Collection dans la navbar
  // via document.getElementById("collection-icon").getBoundingClientRect()

  // Phase 1 + 2 + 3 : position animée
  // Utiliser motion.div avec des keyframes ou animate()

  // La position de départ : centre de l'écran
  // La position d'arrivée : coordonnées de l'icône Collection

  // Overlay plein écran (pointer-events: none sauf sur la plante)
  return (
    <motion.div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Confetti burst (Phase 1) */}
      <ConfettiBurst />

      {/* Plante animée */}
      <motion.img
        src={plantImageUrl}
        className="absolute h-16 w-16 rounded-full object-cover shadow-lg ring-2 ring-white"
        initial={{
          x: "calc(50vw - 32px)",
          y: "calc(50vh - 32px)",
          scale: 0,
          opacity: 0,
        }}
        animate={{
          x: [
            "calc(50vw - 32px)",  // centre
            "calc(50vw - 32px)",  // flottement
            targetX,              // vol → icône
          ],
          y: [
            "calc(50vh - 32px)",
            "calc(50vh - 40px)",  // flottement haut
            targetY,
          ],
          scale: [0, 1.2, 1, 1, 0.3, 0],
          opacity: [0, 1, 1, 1, 1, 0],
          rotate: [0, 0, -5, 5, 0, 0],
        }}
        transition={{
          duration: 1.8,
          times: [0, 0.15, 0.17, 0.44, 0.78, 1],
          ease: [
            [0.34, 1.56, 0.64, 1], // overshoot pour l'apparition
            [0.25, 0.1, 0.25, 1],  // ease-out pour le vol
          ],
        }}
        onAnimationComplete={onComplete}
      />
    </motion.div>
  );
}
```

**Confetti burst :** 12 à 16 particules (`motion.div` rond, 6×6px, couleurs `primary` / `primary-light` / `accent`) qui éclatent radialement depuis le centre avec des trajectoires aléatoires et un fade-out. Utiliser `Array.from({ length: 16 })` avec des offsets randomisés.

**Bounce de l'icône navbar :** Communiquer l'événement via un Zustand store dédié (`useCollectionAnimationStore`) ou un `CustomEvent`. La Bottom Navbar écoute cet événement et déclenche un `motion.div` wrapper sur l'icône Collection avec :

```typescript
animate(iconScale, [1, 1.4, 0.9, 1.1, 1], {
  duration: 0.6,
  ease: "easeOut",
});
```

### 4.6 Filtres Map V2 : recherche par espèce

**Fichier modifié :** `src/components/map/filter-sheet.tsx`

**Ajouts :**

1. **Champ de recherche espèce** en haut du sheet, au-dessus des filtres de taille.
2. **Autocomplete** réutilisant le composant `SpeciesAutocomplete` existant (utilisé dans `/donner`).
3. **Chip espèce active** visible dans la `SearchBar` de la carte (à côté du compteur de filtres).

**Structure mise à jour du FilterSheet :**

```
┌─────────────────────────────────┐
│  Filtres                     [X] │
├─────────────────────────────────┤
│                                 │
│  Espèce                         │
│  ┌─────────────────────────┐    │
│  │ 🔍 Rechercher une espèce│    │  ← SpeciesAutocomplete
│  └─────────────────────────┘    │
│  [Monstera deliciosa  ×]        │  ← Chip si sélectionnée
│                                 │
│  Taille de la bouture           │
│  [Graine] [XS] [S] [M] ...     │
│                                 │
│  Rayon de recherche             │
│  ──●──────────── 15 km          │
│                                 │
│  [Réinitialiser] [Appliquer]    │
└─────────────────────────────────┘
```

**Impact sur `ListingFilters` (`src/lib/types/listing.ts`) :**

```typescript
export interface ListingFilters {
  speciesId?: number;       // NOUVEAU — filtre par species.id
  speciesName?: string;     // NOUVEAU — label affiché dans le chip
  sizes?: ListingSize[];
  radiusKm?: number;
  centerLat?: number;
  centerLng?: number;
}
```

**Impact sur `map-store.ts` :** `activeFilterCount` doit compter `speciesId` comme +1 filtre actif.

**Impact sur `useListingsInBounds` :** Passer `filters.speciesId` à l'appel RPC `get_listings_in_bounds`.

### 4.7 Galerie Fullscreen (Lightbox Apple-like)

**Fichier :** `src/components/ui/lightbox.tsx` (nouveau)

**Technologie :** Framer Motion `layoutId` + portail React pour le plein écran.

**Spécification :**

```typescript
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

interface LightboxProps {
  images: string[];
  initialIndex: number;
  layoutId: string;  // pour la transition partagée avec le carrousel
  onClose: () => void;
}
```

**Comportement :**

1. **Ouverture :** L'utilisateur tape sur une photo dans le `PhotoCarousel` de `/carte/[listingId]`.
2. **Transition :** La photo s'anime depuis sa position dans le carrousel vers le plein écran via `layoutId`. Le fond passe de transparent à `bg-black/95`.
3. **Navigation :** Swipe horizontal entre les photos (même pattern que le carrousel, mais plein écran). Points de pagination en bas.
4. **Zoom :** Pinch-to-zoom avec `useMotionValue` pour `scale` (min: 1, max: 3). Pan activé quand zoomé (`dragConstraints` dynamiques basées sur le scale).
5. **Fermeture :** Swipe vertical vers le bas. La photo suit le doigt (drag `y`). Au-delà de 100px ou vélocité > 500, l'image revient à sa position d'origine via `layoutId` reverse et le fond disparaît.
6. **Feedback tactile :** Pendant le drag de fermeture, le fond s'opacifie proportionnellement (`useTransform(y, [0, 300], [0.95, 0])`) et l'image scale légèrement (`useTransform(y, [0, 300], [1, 0.85])`).

**Intégration dans `listing-detail.tsx` :**

```typescript
// Dans PhotoCarousel, chaque image reçoit un layoutId unique
<motion.img
  layoutId={`listing-photo-${listing.id}-${index}`}
  src={photo}
  onClick={() => setLightboxIndex(index)}
/>

// Lightbox rendue via portail
{lightboxIndex !== null && (
  <Lightbox
    images={listing.photos}
    initialIndex={lightboxIndex}
    layoutId={`listing-photo-${listing.id}-${lightboxIndex}`}
    onClose={() => setLightboxIndex(null)}
  />
)}
```

**Détails "Apple-like" :**
- Coins arrondis de l'image : `rounded-card` (16px) dans le carrousel, `rounded-none` en plein écran — transition fluide via `layoutId`.
- Header minimal : compteur "2/5" en `text-white/80` en haut, bouton X en haut à droite.
- Safe area respectée en bas (déjà géré par `.safe-area-bottom`).
- Transition de fond : `cubic-bezier(0.4, 0, 0.2, 1)` sur 300ms.

---

## 5. Plan d'Implémentation

### Phase 1 — Fondations Base de Données (Sprint 1)

- [x] Créer la migration `20260327000000_v2_transactions.sql`
  - [x] Enum `transaction_type`
  - [x] Enum `transaction_status`
  - [x] `ALTER TABLE listings ADD COLUMN transaction_type`
  - [x] Table `transactions` avec index
  - [x] Politiques RLS sur `transactions`
  - [x] Trigger `handle_transaction_completion`
  - [x] Trigger `notify_transaction_completion`
- [x] Mettre à jour `get_listings_in_bounds` avec paramètre `p_species_id`
- [x] Régénérer `database.types.ts` (`supabase gen types typescript`)
- [x] Mettre à jour `ListingInBounds` et `ListingFilters` dans `src/lib/types/listing.ts`
- [ ] Écrire les tests SQL (pgTAP) pour les transitions de statut

### Phase 2 — Refonte Navigation & Collection (Sprint 1-2)

- [x] Créer la route `/collection` (move depuis `/profil/bibliotheque`)
  - [x] `src/app/collection/page.tsx` — grille avec tabs (Toutes/Possédées/Manquantes)
  - [x] `src/app/collection/[plantId]/page.tsx` — détail plante
  - [x] `src/app/collection/ajouter/page.tsx` — ajout plante
  - [x] `src/app/collection/loading.tsx`
- [x] Redirect 301 `/profil/bibliotheque` → `/collection`
- [x] Mettre à jour `bottom-nav.tsx` : 5 onglets avec Collection (icône `BookOpen`)
- [x] Ajouter `id="collection-icon"` sur l'icône Collection (cible animation)
- [x] Mettre à jour `app-shell.tsx` : patterns de masquage navbar pour `/collection/`
- [x] Renommer "Pokédex des plantes" → "Collection" dans tous les composants
- [x] Mettre à jour les liens dans `/profil/page.tsx` (hub profil → `/collection`)
- [x] Implémenter le bottom sheet "espèce non possédée" dans la Collection
  - [x] Bouton "Chercher sur la carte"
  - [x] Bouton "Ajouter manuellement"
- [x] Ajouter les tabs de filtre (Toutes/Possédées/Manquantes)
- [x] Styling cartes grisées (opacité, grayscale)

### Phase 3 — Flux Donner V2 (Sprint 2)

- [x] Modifier `/donner/page.tsx` : sélecteur de plante depuis Collection
  - [x] Grille horizontale des plantes `status = 'collection'`
  - [x] État vide "Collection vide" avec CTA vers `/collection/ajouter`
- [x] Ajouter le champ `transaction_type` au formulaire
  - [x] Sélecteur 3 options : Don uniquement / Échange uniquement / Les deux
  - [x] Design : chips radio style (pattern existant `SizeSelector`)
- [x] Mettre à jour `listingFormSchema` (Zod) avec `transaction_type`
- [x] Mettre à jour `createListing` / `updateListing` mutations
- [x] Mettre à jour `ListingPreview` pour afficher le type de transaction

### Phase 4 — Filtres Map & Découverte Inversée (Sprint 2)

- [x] Modifier `filter-sheet.tsx` : ajouter recherche par espèce
  - [x] Intégrer `SpeciesAutocomplete` (réutilisation)
  - [x] Chip espèce active avec `X` pour retirer
  - [x] Passer `speciesId` dans `handleApply`
- [x] Modifier `map-store.ts` : `speciesId` / `speciesName` dans filters
- [x] Modifier `useListingsInBounds` : passer `p_species_id` au RPC
- [x] Gérer les query params `/carte?speciesId=X&speciesName=Y` au mount
- [x] Afficher le chip espèce dans la `SearchBar` de la carte
- [x] Mettre à jour `activeFilterCount` pour compter l'espèce

### Phase 5 — Système de Transactions (Sprint 3)

- [x] Créer les mutations Supabase
  - [x] `createTransaction(listingId, offeredListingId?)`
  - [x] `updateTransactionStatus(transactionId, newStatus)`
  - [x] `getTransactionForConversation(conversationId)`
  - [ ] `getUserTransactions(userId)`
- [x] Créer `exchange-proposal-modal.tsx`
  - [x] Chargement des annonces actives de l'utilisateur
  - [x] Sélection + confirmation
  - [x] Envoi de la proposition → INSERT transaction
- [x] Modifier `listing-detail.tsx`
  - [x] Badge "Échange accepté" si applicable
  - [x] Bouton "Proposer un échange" (conditionnel)
  - [x] Bouton "Contacter" (conditionnel sur `transaction_type`)
- [x] Créer `transaction-card.tsx` pour la vue dans les conversations
  - [x] 6 états visuels (pending → completed)
  - [x] Boutons d'action contextuels (Accepter/Refuser/Confirmer)
  - [ ] Realtime subscription sur le statut de la transaction
- [x] Message système automatique dans la conversation lors de la création
- [ ] Notification push lors d'une nouvelle proposition

### Phase 6 — Double Confirmation & Récompense (Sprint 3-4)

- [x] Implémenter les boutons "Plante donnée" / "Plante reçue" dans `TransactionCard`
- [x] Transitions de statut côté client avec optimistic updates
- [x] Créer `plant-capture-animation.tsx`
  - [x] Phase 1 : apparition + confetti burst
  - [x] Phase 2 : flottement
  - [x] Phase 3 : vol vers l'icône Collection (Bézier)
  - [x] Phase 4 : impact + bounce icône navbar
- [x] Créer le store `useCollectionAnimationStore` (Zustand)
- [x] Intégrer le bounce de l'icône dans `bottom-nav.tsx`
- [x] Notification Web Push "Nouvelle plante dans votre Collection"
- [x] Edge Function `push-notify` : handler `transaction_completed`

### Phase 7 — Galerie Fullscreen (Sprint 4)

- [x] Créer `src/components/ui/lightbox.tsx`
  - [x] Transition `layoutId` depuis le carrousel
  - [x] Swipe horizontal (navigation photos)
  - [x] Swipe vertical (fermeture avec physique spring)
  - [ ] Pinch-to-zoom + pan
  - [x] Backdrop opacity lié au drag
- [x] Intégrer dans `listing-detail.tsx` (tap sur photo → lightbox)
- [ ] Intégrer dans la page Collection (détail plante, si applicable)
- [ ] Tester les performances (lazy loading des images haute résolution)

### Phase 8 — Polish & QA (Sprint 4)

- [ ] Audit accessibilité (aria-labels sur les nouveaux composants)
- [ ] Tests E2E : flux complet don → confirmation → animation
- [ ] Tests E2E : flux complet échange → double confirmation
- [ ] Tests E2E : découverte inversée (Collection → carte filtrée)
- [ ] Optimisation mobile < 360px (bottom nav 5 onglets)
- [ ] Gestion offline (PWA) : cache des données Collection
- [ ] Mettre à jour `docs/PRD.md` avec les références V2
- [ ] Mettre à jour le `manifest.ts` si besoin (shortcuts)

---

## Annexes

### A. Résumé des fichiers impactés

| Fichier | Type de modification |
|---------|---------------------|
| `supabase/migrations/20260327000000_v2_transactions.sql` | **Nouveau** |
| `src/lib/types/database.types.ts` | Régénéré |
| `src/lib/types/listing.ts` | Modifié (nouveaux champs) |
| `src/components/layout/bottom-nav.tsx` | Modifié (5 onglets) |
| `src/components/layout/app-shell.tsx` | Modifié (patterns navbar) |
| `src/app/collection/page.tsx` | **Nouveau** (depuis bibliotheque) |
| `src/app/collection/[plantId]/page.tsx` | **Nouveau** |
| `src/app/collection/ajouter/page.tsx` | **Nouveau** |
| `src/app/profil/bibliotheque/page.tsx` | Redirect 301 |
| `src/app/donner/page.tsx` | Modifié (sélecteur Collection) |
| `src/components/map/filter-sheet.tsx` | Modifié (filtre espèce) |
| `src/lib/stores/map-store.ts` | Modifié (speciesId filter) |
| `src/components/listing/listing-detail.tsx` | Modifié (échange + lightbox) |
| `src/components/listing/exchange-proposal-modal.tsx` | **Nouveau** |
| `src/components/chat/transaction-card.tsx` | **Nouveau** |
| `src/components/animations/plant-capture-animation.tsx` | **Nouveau** |
| `src/components/ui/lightbox.tsx` | **Nouveau** |
| `src/lib/supabase/mutations/transactions.ts` | **Nouveau** |
| `src/lib/supabase/queries/transactions.ts` | **Nouveau** |
| `supabase/functions/push-notify/index.ts` | Modifié (handler completion) |

### B. Design tokens utilisés

| Token | Valeur | Usage V2 |
|-------|--------|----------|
| `--color-primary` | `#4A6741` (sauge) | Icône Collection active, cards possédées |
| `--color-accent` | `#C67B5C` (terracotta) | Badge échange, flash animation, CTA échange |
| `--color-success` | `#6B9F3B` | Transaction completed |
| `--color-warning` | `#D4A03C` | Transaction pending |
| `--color-error` | `#D4726A` | Transaction rejected |
| `--color-neutral-100` | `#F8F8F6` | Fond cartes grisées |
| `--font-display` | Fraunces | Titre "Collection" |
| `--radius-card` | 16px | Cards espèce, lightbox transition |
| `--radius-sheet` | 20px | Exchange modal, filter sheet |

### C. Dépendances npm additionnelles

Aucune nouvelle dépendance requise. Le projet utilise déjà :
- `framer-motion` — animations
- `lucide-react` — icônes (`BookOpen` disponible)
- `zustand` — state management
- `@supabase/supabase-js` — client
- `react-hook-form` + `zod` — formulaires

Pour le pinch-to-zoom de la lightbox, si le geste natif Framer Motion s'avère insuffisant, envisager `use-gesture` (~3KB gzip) comme dépendance légère optionnelle.
