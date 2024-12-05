from api import app
from flask import jsonify, request
from api.models.documento import Documento
from api.utils import token_required
from api.db.db import get_db_connection

@app.route('/documento', methods=['GET'])
@token_required
def getDocumentos():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('SELECT * FROM dni')
    documentos = cur.fetchall()
    documentosList = []
    for row in documentos:
        obj = Documento(row)
        documentosList.append(obj.to_json())
    

    conn.close()
    cur.close()
    return jsonify(documentosList), 200

@app.route('/documento', methods=['POST'])
@token_required
def postDocumentos():
    body = request.get_json()
    numero = body['numero']


    conn = get_db_connection()
    cur = conn.cursor()




    cur.execute('SELECT * FROM dni WHERE numero = %s',(numero,))
    row = cur.fetchone()
    if row:
        conn.close()
        cur.close()
        return jsonify({'message':'El numero ya se encuentra ingresado'}), 400

    cur.execute('INSERT INTO dni (numero) VALUES (%s)',(numero,))

    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'message': 'Numero de documento agregado exitosamente'}), 201

@app.route('/documento/<int:dni>', methods=['DELETE'])
@token_required
def borrarDocumento(dni):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('SELECT id FROM dni WHERE numero = %s',(dni,))
    idDni = cur.fetchone()

    cur.execute('SELECT id FROM cliente WHERE dni = %s',(idDni,))
    idCliente = cur.fetchone()

    cur.execute('DELETE FROM turnos WHERE idCliente = %s ',(idCliente,))
    cur.execute('DELETE FROM cliente WHERE dni = %s ',(idDni,))
    cur.execute('DELETE FROM dni WHERE id = %s ',(idDni,))

    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'message': 'Usuario borrado con exito'}), 200

