from functools import wraps
from flask import request, jsonify
import jwt
from api import app
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
    sender_email = ""
    password = ""

    message = MIMEMultipart("alternative")
    message["Subject"] = "Confirmacion de Reserva"
    message["From"] = sender_email
    message["To"] = to_email

    fecha = datos.date.strftime("%m/%d/%Y")
    mes, dia, anio = fecha.split('/')
    mes = mes.lstrip('0')
    dia = dia.lstrip('0')
    date= f"{dia}/{mes}/{anio}"

    text = f"""\
    Tu reserva para el {date} al {datos.title} a sido {mensaje}.
    """
    part = MIMEText(text, "plain")

    message.attach(part)

    try:
        with smtplib.SMTP_SSL("", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, to_email, message.as_string().encode('utf-8'))
        return True
    except Exception as e:
        return False

def send_notification_email(to_email, datos, mensaje):
    sender_email = ""
    password = ""

    message = MIMEMultipart("alternative")
    message["Subject"] = "Confirmaci贸n de Reserva"
    message["From"] = sender_email
    message["To"] = to_email
    text = f"""\
    Hola,
    Te notificamos que para el {datos.date} al {datos.title} se a {mensaje} una reserva.
    """
    part = MIMEText(text, "plain")

    message.attach(part)

    try:
        with smtplib.SMTP_SSL("", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, to_email, message.as_string().encode('utf-8'))
        return True
    except Exception as e:
        return False

def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='email-confirmation-salt')

def send_verification_email(to_email, token):
    sender_email = ""
    password = "1M)rjlGYinzq"

    verification_link = f"http://127.0.0.1:5000/verify/{token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verifica tu correo electrónico"
    message["From"] = sender_email
    message["To"] = to_email

    text = f"Por favor, verifica tu correo haciendo clic en el siguiente enlace: {verification_link}"
    part = MIMEText(text, "plain")

    message.attach(part)

    try:
        with smtplib.SMTP_SSL("", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, to_email, message.as_string().encode('utf-8'))
        return True
    except Exception as e:
        return False

def send_reset_mail(email,token):
    sender_email = ""
    password = ""

    resetLink = f"http://127.0.0.1:5000/recuperar/{token}"
    message = MIMEMultipart("alternative")
    message["Subject"] = "Cambio de credencial"
    message["From"] = sender_email
    message["To"] = email

    text = f"Para restablecer tus credenciales ingresa en el siguiente enlace : {resetLink}, si no solicitaste este cambio ignora este mensaje"
    part = MIMEText(text, "plain")

    message.attach(part)

    
    try:
        with smtplib.SMTP_SSL("", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, email, message.as_string().encode('utf-8'))
        return True
    except Exception as e:
        return False

def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='email-confirmation-salt', max_age=expiration)
    except SignatureExpired:
        return False  # El token ha expirado
    except BadSignature:
        return False  # El token es inválido
    return email