from api import app
from api.models.client import Client
from flask import jsonify, request, render_template, make_response
from api.utils import token_required, confirm_token, generate_confirmation_token, send_verification_email, send_reset_mail
from api.db.db import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import re

@app.route('/admin/login', methods=['POST'])
def inicioSesionAdministrativo():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({"message": "Por favor complete los campos"}), 401

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('SELECT * FROM cliente WHERE email = %s AND verificado = %s AND super = %s', (auth.username, True, True)) #Verifico sus credenciales y si tiene el correo verificado
    row = cur.fetchone()


    if not row:
        conn.close()
        cur.close()
        return jsonify({"message": "Correo electronico o contraseña incorrectas"}), 401
    
    if not check_password_hash(row[6], auth.password):
        conn.close()
        cur.close()
        return jsonify({'message': 'Correo electronico o contraseña incorrectas'}), 401

    token = jwt.encode({'id': row[0], 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=100)}, app.config['SECRET_KEY'])

    conn.close()
    cur.close()

    return jsonify({"token": token, "username": auth.username , "id": row[0]}), 200

@app.route('/login', methods=['POST'])
def inicioSesion():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({"message": "Por favor complete los campos"}), 401

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('SELECT * FROM cliente WHERE email = %s AND verificado = %s', (auth.username, False)) #Si intenta iniciar sesion sin estar verificado
    row = cur.fetchone()
    if row:
        conn.close()
        cur.close()
        return jsonify({"message": "Por favor verifica tu correo electronico"}), 401

    cur.execute('SELECT * FROM cliente WHERE email = %s AND verificado = %s', (auth.username, True)) #Verifico sus credenciales y si tiene el correo verificado
    row = cur.fetchone()


    if not row:
        conn.close()
        cur.close()
        return jsonify({"message": "Correo electronico o contraseña incorrectas"}), 401
    
    if not check_password_hash(row[6], auth.password):
        conn.close()
        cur.close()
        return jsonify({'message': 'Correo electronico o contraseña incorrectas'}), 401

    token = jwt.encode({'id': row[0], 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=100)}, app.config['SECRET_KEY'])


    conn.commit()
    conn.close()
    cur.close()

    
    return jsonify({"token": token, "username": auth.username , "id": row[0]}), 200


@app.route('/register', methods=['POST'])
def clienteNuevo():
    body = request.get_json()
    nombre = body['nombre']
    telefono = body['telefono']
    email = body['email']
    dni = body['dni']
    departamento = body['departamento']
    password = body['password']

    if not validarPass(password):
        return jsonify({'message': "La contraseña introducida no es lo suficientemente segura, asegurese que contenga mas de 8 caracteres, menor a 16 caracteres, una mayuscula, una minuscula y un numero"}), 400


    if not validarPhone(telefono):
        return jsonify({'message': 'El telefono introducido no es correcto'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM cliente WHERE email = %s AND verificado = %s', (email, True))
    row = cur.fetchone() #Primero verifico que el usuario no este reguistrado y verificado
    if row:
        conn.commit()
        conn.close()
        cur.close()
        return jsonify({'message': 'El correo electronico ingresado ya se encuentra en uso'}), 409
    
    cur.execute('SELECT * FROM dni WHERE numero = %s AND enUso = %s', (dni, False))
    rowDni = cur.fetchone() #Verifico si el numero de dni esta y no posee una cuenta reguistrada
    if not rowDni:
        return jsonify({'message': 'El numero de documento no se encuantra registrado o ya posee una cuenta en uso'}), 409

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

    cur.execute('SELECT * FROM cliente WHERE email = %s', (email,))
    row = cur.fetchone() #Busco al cliente, en este punto si esta en la base de datos no esta verificado
    if not row: #En caso de que no este ingreso sus datos, caso contrario los actualizo
        cur.execute('INSERT INTO cliente (nombre,telefono,email,pass,departamento,dni) VALUES (%s, %s, %s,%s,%s,%s)', (nombre, telefono, email, hashed_password, departamento, rowDni[0]))
    else:
        cur.execute('UPDATE cliente SET nombre = %s, telefono = %s, pass = %s, departamento = %s, dni = %s WHERE email = %s', (nombre, telefono, hashed_password, departamento, rowDni[0],email))

    conn.commit()
    conn.close()
    cur.close()

    token = generate_confirmation_token(email)
    send_verification_email(email, token)
 
    return jsonify({'message': "Te hemos enviado un correo para la verificación"}), 201

@app.route('/verify/<string:token>', methods=['GET'])
def verify_email(token):
    email = confirm_token(token)
    if email:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('UPDATE cliente SET verificado = %s WHERE email = %s', (True, email))
        cur.execute('UPDATE dni SET enUso = %s WHERE id = (SELECT dni FROM cliente WHERE email = %s)',(True, email))
        conn.commit()
        conn.close()
        cur.close()
        return render_template('admin.html'), 200
    else:
        return render_template('error.html'), 400

@app.route('/recuperar', methods=['POST'])
def enviarCambioPass():
    body = request.get_json()
    email = body['email']

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('SELECT * FROM cliente WHERE email = %s AND verificado = %s', (email, True))
    row = cur.fetchone()
    if not row:
        conn.close()
        cur.close()
        return jsonify({'message': 'No se a encontrado el correo electrónico introducido'}), 400
    
    conn.close()
    cur.close()
    token = generate_confirmation_token(email)
    send_reset_mail(email, token)

    return jsonify({'message': "Te hemos enviado un correo para la recuperación"}), 200

@app.route('/recuperar/<string:token>', methods=['GET'])
def confirmarCambio(token):
    email = confirm_token(token)
    if email:
        return render_template('password.html', token=token), 200
    else:
        return render_template('error.html'), 400
    
@app.route('/recuperar/<string:token>', methods=['POST'])
def cambiarPass(token):
    email = confirm_token(token)
    if email:
        body = request.get_json()
        password = body['password']

        if not validarPass(password):
            return jsonify({'message': 'La contraseña introducida no es lo suficientemente segura, asegurese que contenga mas de 8 caracteres, menor a 16 caracteres, una mayuscula, una minuscula y un numero'})
    
        conn = get_db_connection()
        cur = conn.cursor()
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

        cur.execute('UPDATE cliente SET pass = %s WHERE email = %s',(hashed_password, email))
        conn.commit()
        conn.close()
        cur.close()
        return jsonify({'message':'Actualización exitosa de la contraseña'})
    else:
        return render_template('error.html'), 400


@app.route('/login/<int:id>', methods=['GET'])
@token_required
def token(id):

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT token FROM cliente WHERE id = %s', (id,))
    row = cur.fetchone()

    
    conn.close()
    cur.close()
    return jsonify({'token':row[0]}), 200


@app.route('/usuario/<int:id>', methods=['GET'])
@token_required
def datosCliente(id):

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, nombre, telefono, email, super, departamento, dni FROM cliente WHERE id = %s', (id,))
    row = cur.fetchone()

    if row is None:
        return jsonify({'message': 'Usuario no encontrado'})
    
    cliente = Client(row)

    cur.execute('SELECT numero FROM dni WHERE id = %s',(row[6],))
    row = cur.fetchone()

    cliente.dni = row[0]
    conn.close()
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

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT pass FROM cliente WHERE id = %s', (id,))
    row = cur.fetchone()
    if not check_password_hash(row[0], password):
        conn.close()
        cur.close()
        return jsonify({'message': 'Contraseña incorrecta'}), 400
    
    if dato == "username":
        cur.execute('UPDATE cliente SET nombre = %s WHERE id = %s', (nuevo,id))
    elif dato == "email":

        if not validarMail(dato):
            conn.close()
            cur.close()
            return jsonify({'message': "El correo introducido no tiene un formato valido"}), 400

        cur.execute('SELECT * FROM cliente WHERE email = %s', (nuevo,))
        row = cur.fetchone()
        if row:
            conn.close()
            cur.close()
            return jsonify({'message': "El correo electronico ingresado ya se encuentra en uso"}), 400
        
        cur.execute('UPDATE cliente SET email = %s WHERE id = %s', (nuevo,id))
    elif dato == "Telefono":
        cur.execute('UPDATE cliente SET telefono = %s WHERE id = %s', (nuevo,id))
    elif dato == "password":

        if not validarPass(nuevo):
            conn.close()
            cur.close()
            return jsonify({'message': "La contraseña introducida no es lo suficientemente segura, asegurese que contenga mas de 8 caracteres, una mayuscula, una minuscula y un numero"}), 400
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
        cur.execute('UPDATE cliente SET pass = %s WHERE id = %s', (hashed_password,id))

    conn.commit()
    conn.close()
    cur.close()
    return jsonify({'message': "Actualización de datos exitosa"}), 200

def validarPass(contraseña):
    return len(contraseña) >= 8 and  re.search(r'[a-z]', contraseña) and re.search(r'[A-Z]', contraseña)  and re.search(r'\d', contraseña) and len(contraseña) < 16
    
def validarMail(email):
    regex = r'^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w+$'

    return re.match(regex, email)

def validarPhone(telefono):
    return len(telefono) > 20 or not re.search(r'[a-z]', telefono) or not re.search(r'[A-Z]', telefono) 