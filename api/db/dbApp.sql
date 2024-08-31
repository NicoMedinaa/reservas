CREATE DATABASE IF NOT EXISTS sistemareservas;
USE sistemareservas;

CREATE TABLE cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100) NOT NULL,
    pass VARCHAR(30) NOT NULL,
    turnoActivo BOOLEAN DEFAULT false,
    super BOOLEAN DEFAULT false,
    verificado BOOLEAN DEFAULT false
);

CREATE TABLE categoriaTurno(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR (20),
    descripcion VARCHAR (200),
    precio INT NOT NULL
);

CREATE TABLE turnos (
    id INT PRIMARY KEY AUTO_INCREMENT ,
    idCliente INT NOT NULL,
    date date,
    descripcion VARCHAR(20),
    idCategoria INT,
    activo BOOLEAN DEFAULT true,
    FOREIGN KEY (idCliente) REFERENCES cliente(id),
    FOREIGN KEY (idCategoria) REFERENCES categoriaTurno(id)
)