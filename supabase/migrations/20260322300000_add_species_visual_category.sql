-- Add visual_category to species for Pokédex illustration mapping
ALTER TABLE species
  ADD COLUMN IF NOT EXISTS visual_category TEXT
  CHECK (visual_category IN (
    'tombante', 'succulente', 'cactus', 'palmier',
    'aracee', 'fougere', 'arbre', 'fleur',
    'herbe_aromatique', 'autre'
  ));
