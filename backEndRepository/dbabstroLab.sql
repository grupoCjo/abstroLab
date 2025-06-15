DROP DATABASE IF EXISTS AbstroLab;
CREATE DATABASE AbstroLab;
USE AbstroLab;

CREATE TABLE usuarios (
    usuario_ID INT PRIMARY KEY AUTO_INCREMENT,
    usuario_nome VARCHAR(100) NOT NULL,
    usuario_data_nascimento DATE NOT NULL,
    usuario_email VARCHAR(150) UNIQUE NOT NULL,
    usuario_senha VARCHAR(255) NOT NULL,
    usuario_genero VARCHAR(20)
);

CREATE TABLE sessoes (
    sessao_ID INT PRIMARY KEY AUTO_INCREMENT,
    usuario_ID INT NOT NULL,
    sessao_data_hora_inicio DATETIME NOT NULL,
    sessao_data_hora_fim DATETIME,
    sessao_duracao TIME,
    sessao_status VARCHAR(20) NOT NULL,
    FOREIGN KEY (usuario_ID) REFERENCES usuarios(usuario_ID) ON DELETE CASCADE
);

CREATE TABLE configuracoes_usuario (
    config_ID INT PRIMARY KEY AUTO_INCREMENT,
    usuario_ID INT NOT NULL UNIQUE, -- Adicionado UNIQUE para garantir 1 configuração por usuário
    tema VARCHAR(20) NOT NULL DEFAULT 'light', -- Adicionado DEFAULT 'light'
    FOREIGN KEY (usuario_ID) REFERENCES usuarios(usuario_ID) ON DELETE CASCADE
);

CREATE TABLE exercicios (
    exercicio_ID INT PRIMARY KEY AUTO_INCREMENT,
    exercicio_codigo VARCHAR(10) UNIQUE,
    posicao_trilha INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    enunciado TEXT,
    alternativas TEXT, -- Armazenar como JSON string
    resposta_correta VARCHAR(255) NOT NULL,
    nivel ENUM('iniciante', 'intermediario', 'avancado') DEFAULT 'iniciante'
    -- 'codigo' foi removido daqui pois o trigger o gera automaticamente
);

DELIMITER //

CREATE TRIGGER before_insert_exercicios
BEFORE INSERT ON exercicios
FOR EACH ROW
BEGIN
    DECLARE next_id INT;

    -- Obter o próximo AUTO_INCREMENT para a tabela exercicios
    SELECT AUTO_INCREMENT INTO next_id
    FROM information_schema.tables
    WHERE table_name = 'exercicios' AND table_schema = DATABASE();

    -- Se o exercicio_codigo não for fornecido ou for NULL, gerá-lo.
    -- Isso permite que, em casos específicos, um código manual seja inserido se necessário.
    IF NEW.exercicio_codigo IS NULL THEN
        SET NEW.exercicio_codigo = CONCAT('EX', LPAD(next_id, 3, '0'));
    END IF;
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

-- Comandos úteis 
-- USE AbstroLab;
-- SELECT * FROM exercicios;
-- DELETE FROM exercicios;
-- ALTER TABLE exercicios AUTO_INCREMENT = 1;
-- TRUNCATE TABLE exercicios;