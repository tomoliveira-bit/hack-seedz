-- Hackathon Seedz · Seed
-- 4 grupos, 15 avaliadores, 22 candidatos

insert into groups (id, name) values
  (1, 'Grupo 1'),
  (2, 'Grupo 2'),
  (3, 'Grupo 3'),
  (4, 'Grupo 4')
on conflict (id) do nothing;

insert into evaluators (name) values
  ('Elias'),
  ('Silvio'),
  ('Tom'),
  ('Jessica'),
  ('Leo'),
  ('Lari'),
  ('Bretas'),
  ('Juan'),
  ('Rico'),
  ('Nerys'),
  ('Will'),
  ('Carol'),
  ('Glauber'),
  ('Daniel'),
  ('Ganem')
on conflict (name) do nothing;

insert into candidates (name, group_id) values
  -- Grupo 1
  ('Rodrigo Prates Ferreira e Maia Gonçalves', 1),
  ('Gabriel Carvalho Gomes', 1),
  ('Caio Cordeiro Fabri', 1),
  ('Leonardo Chiari Maciel', 1),
  ('Max Pedro Candido de Araujo', 1),
  ('Mateus Henrique Saturnino Gonçalves', 1),
  -- Grupo 2
  ('Gabriel Alves Figueiredo', 2),
  ('Henrique Pereira da Cunha', 2),
  ('Thiago Tavares Santos Vasconcelos', 2),
  ('Lucas Soares Benfica', 2),
  ('Bruno Lopes Melo Fonseca', 2),
  ('Breno Moreira Cortez', 2),
  -- Grupo 3
  ('Gabriel Alkmim Barros', 3),
  ('Arthur Damasceno Dalvino', 3),
  ('Estêvão Felipe da Fonseca', 3),
  ('Bernardo Loeser Amaral', 3),
  ('Leonardo Mendes Antero', 3),
  -- Grupo 4
  ('Gabriel Pedro de Souza Rodrigues', 4),
  ('Gustavo Barra Felizardo', 4),
  ('Gustavo Alves Andrade', 4),
  ('Felipe Dias de Souza Martins', 4),
  ('Lucca Montenegro Cintra Castro', 4);
