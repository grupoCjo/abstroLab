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
    usuario_senha VARCHAR(255) NOT NULL,
    usuario_data_nascimento DATE NOT NULL,
    usuario_email VARCHAR(150) UNIQUE NOT NULL,
    usuario_genero VARCHAR(255) NOT NULL
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
    nivel ENUM('iniciante', 'intermediario', 'avancado') DEFAULT 'iniciante'
);

DELIMITER //

CREATE TRIGGER after_insert_exercicios
AFTER INSERT ON exercicios
FOR EACH ROW
BEGIN
    UPDATE exercicios
    SET exercicio_codigo = CONCAT('EX', LPAD(NEW.exercicio_ID, 3, '0'))
    WHERE exercicio_ID = NEW.exercicio_ID;
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
