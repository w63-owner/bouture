-- =============================================================================
-- Seed: species table – Top 50 plantes d'intérieur & balcon en France
-- =============================================================================

INSERT INTO species (common_name, scientific_name, family, visual_category) VALUES
  -- Aracées (aracee) — 6
  ('Monstera deliciosa',   'Monstera deliciosa',          'Araceae',           'aracee'),
  ('Philodendron',         'Philodendron hederaceum',     'Araceae',           'aracee'),
  ('Alocasia',             'Alocasia amazonica',          'Araceae',           'aracee'),
  ('Syngonium',            'Syngonium podophyllum',       'Araceae',           'aracee'),
  ('Anthurium',            'Anthurium andraeanum',        'Araceae',           'aracee'),
  ('Spathiphyllum',        'Spathiphyllum wallisii',      'Araceae',           'aracee'),

  -- Tombantes (tombante) — 6
  ('Pothos',               'Epipremnum aureum',           'Araceae',           'tombante'),
  ('Tradescantia',         'Tradescantia zebrina',        'Commelinaceae',     'tombante'),
  ('Chaîne des cœurs',     'Ceropegia woodii',            'Apocynaceae',       'tombante'),
  ('Hoya',                 'Hoya carnosa',                'Apocynaceae',       'tombante'),
  ('Chlorophytum',         'Chlorophytum comosum',        'Asparagaceae',      'tombante'),
  ('Lierre',               'Hedera helix',                'Araliaceae',        'tombante'),

  -- Succulentes (succulente) — 6
  ('Aloe vera',            'Aloe vera',                   'Asphodelaceae',     'succulente'),
  ('Echeveria',            'Echeveria elegans',           'Crassulaceae',      'succulente'),
  ('Haworthia',            'Haworthiopsis attenuata',     'Asphodelaceae',     'succulente'),
  ('Crassula',             'Crassula ovata',              'Crassulaceae',      'succulente'),
  ('Kalanchoe',            'Kalanchoe blossfeldiana',     'Crassulaceae',      'succulente'),
  ('Sansevieria',          'Dracaena trifasciata',        'Asparagaceae',      'succulente'),

  -- Cactus (cactus) — 4
  ('Cactus de Noël',       'Schlumbergera truncata',      'Cactaceae',         'cactus'),
  ('Cactus San Pedro',     'Echinopsis pachanoi',         'Cactaceae',         'cactus'),
  ('Opuntia',              'Opuntia microdasys',          'Cactaceae',         'cactus'),
  ('Cactus oursin',        'Echinopsis eyriesii',         'Cactaceae',         'cactus'),

  -- Palmiers (palmier) — 5
  ('Kentia',               'Howea forsteriana',           'Arecaceae',         'palmier'),
  ('Areca',                'Dypsis lutescens',            'Arecaceae',         'palmier'),
  ('Palmier nain',         'Chamaedorea elegans',         'Arecaceae',         'palmier'),
  ('Strelitzia',           'Strelitzia nicolai',          'Strelitziaceae',    'palmier'),
  ('Yucca',                'Yucca elephantipes',          'Asparagaceae',      'palmier'),

  -- Fougères (fougere) — 3
  ('Fougère de Boston',    'Nephrolepis exaltata',        'Nephrolepidaceae',  'fougere'),
  ('Capillaire',           'Adiantum raddianum',          'Pteridaceae',       'fougere'),
  ('Fougère nid d''oiseau','Asplenium nidus',             'Aspleniaceae',      'fougere'),

  -- Arbres d'intérieur (arbre) — 6
  ('Ficus elastica',       'Ficus elastica',              'Moraceae',          'arbre'),
  ('Ficus lyrata',         'Ficus lyrata',                'Moraceae',          'arbre'),
  ('Schefflera',           'Schefflera arboricola',       'Araliaceae',        'arbre'),
  ('Pachira',              'Pachira aquatica',            'Malvaceae',         'arbre'),
  ('Dracaena',             'Dracaena marginata',          'Asparagaceae',      'arbre'),
  ('Olivier',              'Olea europaea',               'Oleaceae',          'arbre'),

  -- Fleurs (fleur) — 4
  ('Rose',                 'Rosa × hybrid',               'Rosaceae',          'fleur'),
  ('Hortensia',            'Hydrangea macrophylla',       'Hydrangeaceae',     'fleur'),
  ('Bégonia',              'Begonia maculata',            'Begoniaceae',       'fleur'),
  ('Lavande',              'Lavandula angustifolia',      'Lamiaceae',         'fleur'),

  -- Herbes aromatiques (herbe_aromatique) — 6
  ('Basilic',              'Ocimum basilicum',            'Lamiaceae',         'herbe_aromatique'),
  ('Menthe',               'Mentha spicata',              'Lamiaceae',         'herbe_aromatique'),
  ('Romarin',              'Salvia rosmarinus',           'Lamiaceae',         'herbe_aromatique'),
  ('Thym',                 'Thymus vulgaris',             'Lamiaceae',         'herbe_aromatique'),
  ('Sauge',                'Salvia officinalis',          'Lamiaceae',         'herbe_aromatique'),
  ('Ciboulette',           'Allium schoenoprasum',        'Amaryllidaceae',    'herbe_aromatique'),

  -- Autres (autre) — 4
  ('Pilea peperomioides',  'Pilea peperomioides',         'Urticaceae',        'autre'),
  ('Calathea',             'Calathea orbifolia',          'Marantaceae',       'autre'),
  ('Maranta',              'Maranta leuconeura',          'Marantaceae',       'autre'),
  ('Peperomia',            'Peperomia obtusifolia',       'Piperaceae',        'autre')
ON CONFLICT DO NOTHING;
