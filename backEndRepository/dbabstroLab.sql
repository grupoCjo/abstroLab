/* 
    Notas para o grupo
    REFERENCES é p FK
    ON DELETE CASCADE - Se o registro principal for apagado, apaga os registros dependentes    
    ON UPDATE CASCADE - Se o registro principal for alterado, altera tbm os registros dependentes
    leia-se: registro principal como PK

    -Bea
*/

DROP DATABASE IF EXISTS AbstroLab;
CREATE DATABASE AbstroLab;
USE AbstroLab;

CREATE TABLE usuarios (
    usuario_ID INT PRIMARY KEY AUTO_INCREMENT,
    usuario_nome VARCHAR(100) NOT NULL,
    usuario_data_nascimento DATE NOT NULL,
    usuario_email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE sessoes (
    sessao_ID INT PRIMARY KEY AUTO_INCREMENT,
    usuario_ID INT NOT NULL,
    sessao_data_hora_inicio DATETIME NOT NULL,
    sessao_data_hora_fim DATETIME NOT NULL,
    sessao_duracao TIME NOT NULL,
    sessao_status BOOLEAN NOT NULL,
    FOREIGN KEY (usuario_ID) REFERENCES usuarios(usuario_ID) ON DELETE CASCADE
);

CREATE TABLE configuracoes_usuario (
    config_ID INT PRIMARY KEY AUTO_INCREMENT,
    usuario_ID INT NOT NULL,
    tema VARCHAR(20) NOT NULL,
    FOREIGN KEY (usuario_ID) REFERENCES usuarios(usuario_ID) ON DELETE CASCADE
);

CREATE TABLE exercicios (
    exercicio_ID INT PRIMARY KEY AUTO_INCREMENT,
    exercicio_codigo VARCHAR(10) UNIQUE,
    posicao_trilha INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    enunciado TEXT,
    alternativas TEXT,
    resposta_correta VARCHAR(255) NOT NULL,
    nivel ENUM('iniciante', 'intermediario', 'avancado') DEFAULT 'iniciante',
    codigo LONGTEXT
    );
DELIMITER //

CREATE TRIGGER before_insert_exercicios
BEFORE INSERT ON exercicios
FOR EACH ROW

BEGIN
    DECLARE proximo_id INT;

    -- Pega o próximo valor de AUTO_INCREMENT da tabela
    SELECT AUTO_INCREMENT INTO proximo_id
    FROM information_schema.tables
    WHERE table_name = 'exercicios'
      AND table_schema = DATABASE();

    -- Gera o código no formato EX001, EX002, etc.
    SET NEW.exercicio_codigo = CONCAT('EX', LPAD(proximo_id, 3, '0'));
END;
//

DELIMITER ;

CREATE TABLE progresso_exercicios (
    usuario_ID INT NOT NULL,
    exercicio_ID INT NOT NULL,
    PRIMARY KEY (usuario_ID, exercicio_ID),
    FOREIGN KEY (usuario_ID) REFERENCES usuarios(usuario_ID) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_ID) REFERENCES exercicios(exercicio_ID) ON DELETE CASCADE
);
USE Abstrolab;
select * FROM exercicios;
-- 1. Apaga todos os dados da tabela
DELETE FROM exercicios;

-- 2. Reinicia o contador AUTO_INCREMENT
ALTER TABLE exercicios AUTO_INCREMENT = 1;

TRUNCATE TABLE exercicios;
