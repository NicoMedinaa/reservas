CREATE DATABASE IF NOT EXISTS sistemareservas;
USE sistemareservas;

CREATE TABLE cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) NOT NULL,
    departamento INT NOT NULL,
    dni INT NOT NULL,
    pass VARCHAR(50) NOT NULL,
    turnoActivo BOOLEAN DEFAULT false,
    super BOOLEAN DEFAULT false,
    verificado BOOLEAN DEFAULT false,
    FOREIGN KEY (dni) REFERENCES dni(id)
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

CREATE TABLE dni (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero INT NOT NULL,
    enUso BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE rubros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR (30) NOT NULL,
    descripcion text
);

CREATE TABLE categoriaRubros(
    id INT PRIMARY KEY AUTO_INCREMENT,
    idRubro INT,
    mes INT NOT NULL,
    anio INT NOT NULL,
    importe float NOT NULL DEFAULT 0,
    comprobante INT NOT NULL DEFAULT 0,
    FOREIGN KEY (idRubro) REFERENCES rubros(id)
);

INSERT INTO cliente (nombre, telefono, email, pass, super, verificado) VALUES ('Raul Pellerito', '2932617278', 'raulpellerito@gmail.com', 'Micontraseña123', true, true);
INSERT INTO categoriaTurno (nombre, precio) VALUES ('Turno1', 1);
INSERT INTO categoriaTurno (nombre, precio) VALUES ('Turno2', 1);