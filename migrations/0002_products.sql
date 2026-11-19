CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  fr TEXT NOT NULL, en TEXT NOT NULL,
  dfr TEXT NOT NULL DEFAULT '', den TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🧁',
  color TEXT NOT NULL DEFAULT '#ece4f6',
  active INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0,
  photo TEXT,
  updated INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT OR IGNORE INTO settings VALUES ('delivery_fee', '1000');
INSERT OR IGNORE INTO products (id,fr,en,dfr,den,price,emoji,color,sort) VALUES
 ('croissant','Croissant','Croissant','Pur beurre, feuilleté et doré.','Butter, flaky and golden.',700,'🥐','#fde7c2',1),
 ('beignet','Beignet glacé','Glazed doughnut','Moelleux, glaçage au choix.','Soft, glaze of your choice.',600,'🍩','#fdd9e2',2),
 ('cupcake','Cupcake','Cupcake','Vanille ou chocolat, crème légère.','Vanilla or chocolate, light cream.',1500,'🧁','#e9defa',3),
 ('part','Part de gâteau','Slice of cake','Fraise, chocolat ou citron.','Strawberry, chocolate or lemon.',2500,'🍰','#ffe0d6',4),
 ('cookie','Cookie','Cookie','Pépites de chocolat, cœur tendre.','Chocolate chips, soft centre.',500,'🍪','#f3e0c8',5),
 ('tarte','Tarte aux fruits','Fruit tart','Fruits de saison sur crème pâtissière.','Seasonal fruit on custard.',3000,'🥧','#fbe8b8',6),
 ('flan','Flan pâtissier','Custard flan','Crème vanille sur pâte croustillante.','Vanilla custard on crisp pastry.',1200,'🍮','#fff0c4',7),
 ('gateau','Gâteau d''anniversaire','Birthday cake','Sur commande, 8 à 10 parts.','Made to order, 8 to 10 slices.',15000,'🎂','#fcd5e5',8);
