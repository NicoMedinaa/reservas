from api import app
from api.db.db import get_db_connection
from api.utils import token_required
from flask import jsonify, request
from api.models.rubro import Rubro

@app.route('/rubro', methods=['POST'])
@token_required
def nuevoRubro():
    body = request.get_json()
    nombre = body['nombre']
    descripcion = body['descripcion']

    conn = get_db_connection()
    cur = conn.cursor()

    if descripcion:
        cur.execute('INSERT INTO rubros (nombre, descripcion) VALUES (%s, %s)',(nombre,descripcion))
    else:
        cur.execute('INSERT INTO rubros (nombre) VALUES (%s)',(nombre,))

    conn.commit()
    conn.close()
    cur.close()

    return jsonify({'message': 'Rubro añadido con exito'}), 201

@app.route('/rubro/<int:month>+<int:year>', methods=['GET'])
@token_required
def nuevoCategoriaRubro(month, year):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('SELECT * FROM rubros')
    rubros = cur.fetchall()
    rubrosList = []
    for row in rubros:
        cur.execute('SELECT rubros.id, rubros.nombre, categoriaRubros.importe, categoriaRubros.comprobante, rubros.descripcion FROM categoriaRubros INNER JOIN rubros ON categoriaRubros.idRubro = rubros.id AND categoriaRubros.idRubro = %s AND categoriaRubros.mes = %s AND categoriaRubros.anio = %s',(row[0], month, year))
        fila = cur.fetchone()
        if fila:
            obj = Rubro(fila)
        else:
            vacio = [row[0], row[1], '', '', row[2]]
            obj = Rubro(vacio)
        rubrosList.append(obj.to_json())

    conn.close()
    cur.close()

    return jsonify(rubrosList), 200

@app.route('/rubro', methods=['PUT'])
@token_required
def editarRubro():
    body = request.get_json()
    id = body['idRubro']
    nombre = body['nombre']
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('UPDATE rubros SET nombre = %s WHERE id = %s',(nombre, id))
    conn.commit()
    conn.close()
    cur.close()

    return jsonify({'message': 'Rubro editado con exito'}), 200

@app.route('/rubro/tabla', methods=['POST'])
@token_required
def nuevaTabla():
    body = request.get_json()
    mes = body['mes']
    anio = body['anio']
    tabla = body['table']

    conn = get_db_connection()
    cur = conn.cursor()

    for rubro in tabla:
        cur.execute('SELECT id FROM rubros WHERE nombre = %s',(rubro['rubros'],)) #Busco la id del rubro es especifico
        nombreRubro = cur.fetchone()
        cur.execute('UPDATE rubros SET descripcion = %s WHERE id = %s',(rubro['detalle'],nombreRubro)) #Le cambio la descripcion de ser necesario

        cur.execute('SELECT * FROM categoriaRubros WHERE idRubro = %s AND mes = %s AND anio = %s',(nombreRubro[0], mes, anio))#Busco para ver si ya se ingreso en ese respectivo año
        row = cur.fetchone()
        if not row:#De no haber nada ingreso los datos
            cur.execute('INSERT INTO categoriaRubros (idRubro, mes, anio, importe, comprobante) VALUES (%s, %s, %s, %s,%s)',(nombreRubro[0], mes, anio, rubro['importe'], rubro['comprobante']))
        else:#Caso contrario los actualizo
            cur.execute('UPDATE categoriaRubros SET importe = %s, comprobante = %s WHERE idRubro = %s AND mes = %s AND anio = %s', (rubro['importe'], rubro['comprobante'], nombreRubro[0], mes, anio))


    conn.commit()
    conn.close()
    cur.close()

    return jsonify({'message': 'Tabla guardada con exito'}), 201

@app.route('/rubro/<int:id>', methods=['DELETE'])
@token_required
def borrarRubro(id):
    
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('DELETE FROM categoriaRubros WHERE idRubro = %s',(id,))
    cur.execute('DELETE FROM rubros WHERE id = %s',(id,))

    conn.commit()
    conn.close()
    cur.close()

    return jsonify({'message': 'Rubro eliminado con exito'}), 200

@app.route('/rubro/years', methods=['GET'])
@token_required
def getAnios():

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('SELECT DISTINCT anio FROM categoriaRubros')
    anios = cur.fetchall()
    
    conn.close()
    cur.close()

    return jsonify({'anios': anios}), 200