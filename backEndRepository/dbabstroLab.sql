/*
    Notas para o grupo
    REFERENCES é usado p indicar FK
    ON DELETE CASCADE - Se o registro principal for apagado, apaga os registros dependentes    
    ON UPDATE CASCADE - Se o registro principal for alterado, altera tbm os registros dependentes
    leia-se: registro principal como PK

    -Bea
*/
CREATE DATABASE IF NOT EXISTS AbstroLab;
USE AbstroLab;

CREATE TABLE usuarios (
    usuario_ID VARCHAR(7) PRIMARY KEY,
    usuario_nome VARCHAR(100) NOT NULL,
    usuario_data_nascimento DATE NOT NULL,
    usuario_email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE sessoes (
    sessao_ID VARCHAR(10) PRIMARY KEY,
    usuario_ID VARCHAR(7) NOT NULL,
    sessao_data_hora_inicio DATETIME NOT NULL,
    sessao_data_hora_fim DATETIME NOT NULL,
    sessao_duracao TIME NOT NULL,
    sessao_status BOOLEAN NOT NULL,
    FOREIGN KEY (usuario_ID) REFERENCES usuarios(usuario_ID) ON DELETE CASCADE
);

CREATE TABLE configuracoes_usuario (
    config_ID VARCHAR(10) PRIMARY KEY,
    usuario_ID VARCHAR(7) NOT NULL,
    tema VARCHAR(20) NOT NULL,
    FOREIGN KEY (usuario_ID) REFERENCES usuarios(usuario_ID) ON DELETE CASCADE
);

CREATE TABLE exercicios (
    exercicio_ID VARCHAR(10) PRIMARY KEY,
    posicao_trilha INT NOT NULL,
    resposta_correta VARCHAR(255) NOT NULL
);

CREATE TABLE progresso_exercicios (
    usuario_ID VARCHAR(7) NOT NULL,
    exercicio_ID VARCHAR(10) NOT NULL,
    PRIMARY KEY (usuario_ID, exercicio_ID),
    FOREIGN KEY (usuario_ID) REFERENCES usuarios(usuario_ID) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_ID) REFERENCES exercicios(exercicio_ID) ON DELETE CASCADE
);
