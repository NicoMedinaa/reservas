CREATE DATABASE IF NOT EXISTS sistemareservas;
USE sistemareservas;

CREATE TABLE cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) NOT NULL,
    pass VARCHAR(50) NOT NULL,
    turnoActivo BOOLEAN DEFAULT false,
    super BOOLEAN DEFAULT false,
    verificado BOOLEAN DEFAULT false
);

CREATE TABLE categoriaTurno(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR (30),
    descripcion VARCHAR (200),
    precio INT NOT NULL
);

CREATE TABLE turnos (
    id INT PRIMARY KEY AUTO_INCREMENT ,
    idCliente INT NOT NULL,
    date date,
    descripcion VARCHAR(30),
    idCategoria INT,
    activo BOOLEAN DEFAULT true,
    FOREIGN KEY (idCliente) REFERENCES cliente(id),
    FOREIGN KEY (idCategoria) REFERENCES categoriaTurno(id)
);

INSERT INTO cliente (nombre, telefono, email, pass, super, verificado) VALUES ('Raul Pellerito', '2932617278', 'raulpellerito@gmail.com', 'Micontraseña123', true, true);
INSERT INTO categoriaTurno (nombre, precio) VALUES ('Turno1', 1);
INSERT INTO categoriaTurno (nombre, precio) VALUES ('Turno2', 1);