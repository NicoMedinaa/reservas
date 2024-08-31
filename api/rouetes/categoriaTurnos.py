from api import app
from flask import jsonify, request
from api.models.categoriaTurnos import CategoriaTurnos
from api.utils import token_required
from api.db.db import mysql

@app.route('/categorias', methods=['GET'])
@token_required
def categorias():
    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM categoriaTurno')
    categorias = cur.fetchall()
    categoriasList = []
    for row in categorias:
        obj = CategoriaTurnos(row)
        categoriasList.append(obj.to_json())
    
    mysql.connection.commit()
    cur.close()
    return jsonify(categoriasList), 200

@app.route('/categorias', methods=['PUT'])
@token_required
def editarCategorias():
    body = request.get_json()
    id = body['idCategoria']
    nombre = body['nombre']
    precio = body['precio']
    
    cur = mysql.connection.cursor()
    if nombre:
        cur.execute('UPDATE turnos SET descripcion = %s WHERE idCategoria = %s',(nombre, id))
        cur.execute('UPDATE categoriaTurno SET nombre = %s WHERE id = %s',(nombre, id))
    if precio:
        cur.execute('UPDATE categoriaTurno SET precio = %s WHERE id = %s',(precio, id))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': "Modificación exitosa"}), 200