from api import app
from api.models.client import Client
from flask import jsonify, request, render_template
from api.utils import token_required, confirm_token, generate_confirmation_token, send_verification_email
from api.db.db import mysql
import jwt
import datetime
import re

@app.route('/login', methods=['POST'])
def inicioSesion():
    auth = request.authorization

    """ Control: existen valores para la autenticacion? """
    if not auth or not auth.username or not auth.password:
        return jsonify({"message": "No autorizado"}), 401

    """ Control: existe y coincide el usuario en la BD? """
    cur = mysql.connection.cursor()

    cur.execute('SELECT * FROM cliente WHERE email = %s AND verificado = %s', (auth.username, False))
    row = cur.fetchone()
    if row:
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Por favor verifica tu correo electronico"}), 401

    cur.execute('SELECT * FROM cliente WHERE email = %s AND pass = %s AND verificado = %s', (auth.username, auth.password, True))
    row = cur.fetchone()
    if not row:
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Correo electronico o contraseña incorrectas"}), 401
    
    

    """ El usuario existe en la BD y coincide su contraseña """


    token = jwt.encode({'id': row[0], 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=100)}, app.config['SECRET_KEY'])
    mysql.connection.commit()
    cur.close()
    return jsonify({"token": token, "username": auth.username , "id": row[0]}), 200



@app.route('/register', methods=['POST'])
def clienteNuevo():
    body = request.get_json()
    nombre = body['nombre']
    telefono = body['telefono']
    email = body['email']
    password = body['password']

    if not validarPass(password):
        return jsonify({'message': "La contraseña introducida no es lo suficientemente segura, asegurese que contenga mas de 8 caracteres, una mayuscula, una minuscula y un numero"}), 400


    # If the string matches the regex, it is a valid email

    if not validarMail(email):
        return jsonify({'message': "El correo introducido no tiene un formato valido"}), 400



    cur = mysql.connection.cursor()
    cur.execute('SELECT * FROM cliente WHERE email = %s AND verificado = %s', (email, True))
    row = cur.fetchone()
    if row:
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'El correo electronico ingresado ya se encuentra en uso'}), 409
    cur.execute('SELECT * FROM cliente WHERE email = %s', (email,))
    row = cur.fetchone()
    if not row:
        cur.execute('INSERT INTO cliente (nombre,telefono,email,pass) VALUES (%s, %s, %s,%s)', (nombre, telefono, email, password))
    else:
        cur.execute('UPDATE cliente SET nombre = %s, telefono = %s, pass = %s WHERE email = %s', (nombre, telefono, password, email))

    token = generate_confirmation_token(email)
    send_verification_email(email, token)

    mysql.connection.commit()
    cur.close()
 
    return jsonify({'message': "Te hemos enviado un correo para la verificación"}), 201

@app.route('/verify/<string:token>', methods=['GET'])
def verify_email(token):
    email = confirm_token(token)
    if email:
        cur = mysql.connection.cursor()
        cur.execute('UPDATE cliente SET verificado = %s WHERE email = %s', (True, email))
        mysql.connection.commit()
        cur.close()
        render_template('admin.html')
        return render_template('admin.html'), 200
    else:
        
        return render_template('error.html'), 400

@app.route('/usuario/<int:id>', methods=['GET'])
@token_required
def datosCliente(id):

    cur = mysql.connection.cursor()
    cur.execute('SELECT id, nombre, telefono, email, super FROM cliente WHERE id = %s', (id,))
    row = cur.fetchone()

    if row is None:
        return jsonify({'message': 'Usuario no encontrado'})
    
    cliente = Client(row)
    mysql.connection.commit()
    cur.close()
    return jsonify(cliente.to_json()), 200


@app.route('/usuario', methods=['PUT'])
@token_required
def editarCliente():
    body = request.get_json()
    id = body['id']
    dato = body['dato']
    nuevo = body['nuevo']
    password = body['password']

    cur = mysql.connection.cursor()
    cur.execute('SELECT pass FROM cliente WHERE id = %s', (id,))
    row = cur.fetchone()
    if row[0] != password:
        return jsonify({'message': 'Contraseña incorrecta'}), 400
    
    if dato == "username":
        cur.execute('UPDATE cliente SET nombre = %s WHERE id = %s', (nuevo,id))
    elif dato == "email":

        if not validarMail(dato):
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': "El correo introducido no tiene un formato valido"}), 400

        cur.execute('SELECT * FROM cliente WHERE email = %s', (nuevo,))
        row = cur.fetchone()
        if row:
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': "El correo electronico ingresado ya se encuentra en uso"}), 400
        
        cur.execute('UPDATE cliente SET email = %s WHERE id = %s', (nuevo,id))
    elif dato == "Telefono":
        cur.execute('UPDATE cliente SET telefono = %s WHERE id = %s', (nuevo,id))
    elif dato == "password":

        if not validarPass(nuevo):
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': "La contraseña introducida no es lo suficientemente segura, asegurese que contenga mas de 8 caracteres, una mayuscula, una minuscula y un numero"}), 400
        cur.execute('UPDATE cliente SET pass = %s WHERE id = %s', (nuevo,id))

    mysql.connection.commit()
    cur.close()
    return jsonify({'message': "Actualización de datos exitosa"}), 200

def validarPass(contraseña):
    return len(contraseña) >= 8 and  re.search(r'[a-z]', contraseña) and re.search(r'[A-Z]', contraseña)  and re.search(r'\d', contraseña)
    
def validarMail(email):
    regex = r'^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w+$'

    # If the string matches the regex, it is a valid email

    return re.match(regex, email)