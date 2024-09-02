from api import app
from flask import jsonify, request
from api.utils import token_required, send_reservation_email, send_notification_email
from api.db.db import mysql
from api.models.turnos import Turnos
from datetime import datetime
from flask_mail import Mail, Message
mail = Mail(app)

@app.route('/calendario', methods=['GET'])
@token_required
def eventos():
    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM turnos')
    events = cur.fetchall()
    eventsList = []
    for row in events:
        obj = Turnos(row)
        fecha = row[2].strftime("%m/%d/%Y")
        
        
        mes, dia, anio = fecha.split('/')

        mes = mes.lstrip('0')
        dia = dia.lstrip('0')
        obj.date= f"{mes}/{dia}/{anio}"


        eventsList.append(obj.to_json())

    mysql.connection.commit()
    cur.close()
    return jsonify(eventsList), 200

@app.route('/calendario', methods=['POST'])
@token_required
def nuevoEvento():
    body = request.get_json()
    idUser = (body['id'])
    horario = body['horario']
    descripcion = body['title']
    date = datetime.strptime(horario, "%m/%d/%Y").date()

    cur = mysql.connection.cursor()
    cur.execute('SELECT turnoActivo FROM cliente WHERE id = %s', (idUser,))
    row = cur.fetchone()
    
    if row[0]: #En caso de que el usuario ya disponga de una reserva
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Solo se puede tener 1(uno) turno activo, si desea cambiarlo primero cancele su reserva actual'}), 409
    
    cur.execute('SELECT * FROM turnos WHERE date = %s AND descripcion = %s', (date, descripcion))
    row = cur.fetchone()

    if row is not None: #En caso de que dos usuarios intenten reservar un turno al mismo tiempo
        return jsonify({'message': "A ocurrido un error inesperado, pruebe a reiniciar la paguina"}), 409

    cur.execute('SELECT id FROM categoriaTurno WHERE nombre = %s',(descripcion,))
    data = cur.fetchone()

    cur.execute('INSERT INTO turnos (idCliente, date, idCategoria, descripcion) VALUES (%s, %s, %s, %s)', (idUser, date, data, descripcion))
    cur.execute('UPDATE cliente SET turnoActivo = %s WHERE id = %s ', (True, idUser))
    
    cur.execute('SELECT * FROM turnos WHERE idCliente = %s AND activo = %s', (idUser, True))
    row = cur.fetchone()
    cur.execute('SELECT * FROM cliente WHERE id = %s ', (idUser,))
    cliente = cur.fetchone()
    obj = Turnos(row)
    obj.idUsuario = cliente[1] 
    
    send_reservation_email(cliente[3], obj, "confirmada")
    
    send_notification_email(obj, "confirmada")
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Evento añadido"}), 201

@app.route('/calendario/<string:date>', methods=['GET'])
@token_required
def detallesDia(date):
    horario = date.replace('.', '/')
    date = datetime.strptime(horario, "%m/%d/%Y").date()
    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM turnos WHERE date = %s', (date,))
    datos = cur.fetchall()
    datosList = []
    for row in datos:
        obj = Turnos(row)
        cur.execute('SELECT nombre FROM cliente WHERE id = %s', (row[1],))
        obj.idUsuario = cur.fetchone()
        cur.execute('SELECT nombre FROM categoriaTurno WHERE id = %s', (row[4],))
        obj.idCategoria = cur.fetchone()
        datosList.append(obj.to_json())

    mysql.connection.commit()
    cur.close()
    return jsonify(datosList), 200

@app.route('/calendario/', methods=['PUT'])
@token_required
def turnoActivo():
    body = request.get_json()
    id = body['id']
    horario = body['date']
    date = datetime.strptime(horario, "%m/%d/%Y").date()
    cur = mysql.connection.cursor()
    cur.execute('UPDATE cliente c JOIN turnos t ON c.id = t.idCliente SET c.turnoActivo = %s, t.activo = %s WHERE c.id = %s AND t.activo = %s AND t.date < %s',(False, False, id, True, date))
    
    cur.execute('SELECT turnoActivo FROM cliente WHERE id = %s',(id,))
    row = cur.fetchone()
    mysql.connection.commit()
    cur.close()
    return jsonify({"Turno": row[0]}), 200

@app.route('/calendario/<int:id>', methods=['DELETE'])
@token_required
def cancelarTurno(id):
    cur = mysql.connection.cursor()
    
    cur.execute('SELECT * FROM turnos WHERE idCliente = %s AND activo = %s', (id, True))
    row = cur.fetchone()
    cur.execute('SELECT * FROM cliente WHERE id = %s ', (id,))
    cliente = cur.fetchone()
    obj = Turnos(row)
    obj.idUsuario = cliente[1] 
    
    send_reservation_email(cliente[3], obj, "cancelada")
    send_notification_email(obj, "cancelada")
    
    cur.execute('DELETE FROM turnos WHERE idCliente = %s AND activo = %s',(id, True))
    cur.execute('UPDATE cliente SET turnoActivo = %s WHERE id = %s',(False, id))


    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Reserva cancelada exitosamente"}), 200