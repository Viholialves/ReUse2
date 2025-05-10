CREATE DATABASE IF NOT EXISTS reuse_db;

USE reuse_db;

CREATE TABLE IF NOT EXISTS reuse_db.users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_picture VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela para ratings
CREATE TABLE reuse_db.user_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  trade_id INT NOT NULL,
  rating INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES reuse_db.users(id)
);

CREATE TABLE reuse_db.produtos(
  id int NOT NULL AUTO_INCREMENT,
  fotos json NOT NULL,
  user_id int NOT NULL,
  nome varchar(255) NOT NULL,
  tags json,
  descricao TEXT,
  estado ENUM('novo', 'sem-marcas','com-marcas', 'usado') NOT NULL,
  valor float NOT NULL,
  city varchar(255) NOT NULL,
  state varchar(255) NOT NULL,
  status int NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY(user_id) REFERENCES reuse_db.users(id)
);

CREATE TABLE reuse_db.trades(
  id int AUTO_INCREMENT NOT NULL,
  user_id int NOT NULL,
  product_id int NOT NULL,
  offered_product_id int NOT NULL,
  message text,
  status int NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  FOREIGN KEY(user_id) REFERENCES reuse_db.users(id),
  FOREIGN KEY(product_id) REFERENCES reuse_db.produtos(id),
  FOREIGN KEY(offered_product_id) REFERENCES reuse_db.produtos(id)
);
drop table reuse_db.trades;
/* status
0 = pendente 
1 = aceito
2 = negado
 */

insert INTO reuse_db.produtos(user_id, fotos, nome, tags, descricao, estado, valor, city, state, status) 
VALUES (1, '[{"url": "foto1.jpg"}, {"url": "foto2.jpg"}]', 'Carro', '["Cheroso", "lindo"]', 'Seila', 'novo', 5.10, 'TO', 'Palmas', 1);

insert into reuse_db.user_ratings(user_id, trade_id, rating) values (1,0,5);

SELECT
  t.id,
  t.user_id as user_sender,
  p1.user_id as user_reciver,
  t.message,
  t.status,
  t.created_at,
  t.updated_at,
  p1.id as id1,
  JSON_UNQUOTE(p1.fotos) as fotos1,
  p1.nome as nome1,
  p1.descricao as descricao1,
  p1.valor as valor1,
  p2.id as id2,
  JSON_UNQUOTE(p2.fotos) as fotos2,
  p2.nome as nome2,
  p2.descricao as descricao2,
  p2.valor as valor2
FROM reuse_db.trades t
JOIN reuse_db.produtos as p1 ON p1.id = t.product_id
JOIN reuse_db.produtos as p2 ON p2.id = t.offered_product_id;


SELECT * FROM reuse_db.produtos WHERE user_id = 1;

select * from reuse_db.produtos;

select * from reuse_db.users;

select * from reuse_db.user_ratings;

select * from reuse_db.trades;



drop table reuse_db.users;

drop table reuse_db.produtos;