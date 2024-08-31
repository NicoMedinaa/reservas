from functools import wraps
from flask import request, jsonify
import jwt
from api import app
from api.db.db import mysql
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature


def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Falta el TOKEN'}), 401

        nombre_user = None
        if 'id' in request.headers:
            nombre_user = int(request.headers['id'])
        if not nombre_user:
            return jsonify({'message': 'Falta el usuario'}), 402

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            exp = data['exp']
            nombre_token = data['id']
            if nombre_user != nombre_token:
                return jsonify({'message': 'Error de nombre'}), 401
        except Exception as e:
            return jsonify({'message': str(e)}), 401
        return func(*args, **kwargs)
    return decorated


def send_reservation_email(to_email, datos, mensaje):
    sender_email = "bolibearrodrgez@gmail.com"
    password = ""

    message = MIMEMultipart("alternative")
    message["Subject"] = "Confirmación de Reserva"
    message["From"] = sender_email
    message["To"] = to_email
    print (datos)
    text = f"""\
    Hola {datos.idUsuario},
    Tu reserva para el dia {datos.date} a las {datos.title} sido {mensaje}.
    Detalles:
    """
    part = MIMEText(text, "plain")

    message.attach(part)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, to_email, message.as_string())
        print("Correo enviado exitosamente")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")

def send_notification_email(datos, mensaje):
    sender_email = "bolibearrodrgez@gmail.com"
    password = "gvti wawk fikn ogex"
    to_email = ""

    message = MIMEMultipart("alternative")
    message["Subject"] = "Confirmación de Reserva"
    message["From"] = sender_email
    message["To"] = to_email
    print (datos)
    text = f"""\
    Hola Raul,
    Tu notificamos que para el dia {datos.date} a las {datos.title} {datos.idUsuario} a {mensaje} una reserva.
    Detalles:
    """
    part = MIMEText(text, "plain")

    message.attach(part)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, to_email, message.as_string())
        print("Correo enviado exitosamente")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")

def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='email-confirmation-salt')

def send_verification_email(to_email, token):
    sender_email = "bolibearrodrgez@gmail.com"
    password = "gvti wawk fikn ogex"

    verification_link = f"http://127.0.0.1:5000/verify/{token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verifica tu correo electrónico"
    message["From"] = sender_email
    message["To"] = to_email

    text = f"Por favor, verifica tu correo haciendo clic en el siguiente enlace: {verification_link}"
    part = MIMEText(text, "plain")

    message.attach(part)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, to_email, message.as_string())

def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='email-confirmation-salt', max_age=expiration)
    except SignatureExpired:
        return False  # El token ha expirado
    except BadSignature:
        return False  # El token es inválido
    return email