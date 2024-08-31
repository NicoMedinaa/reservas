from api import app
from flask_mysqldb import MySQL

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'admin'# nombre dew usuario elejido
app.config['MYSQL_PASSWORD'] ='432287' # contra elejida
app.config['MYSQL_DB'] = 'sistemareservas'
app.config['STATIC_FOLDER'] = 'static' # para servir tu aplicación web y necesitas servir archivos estáticos

mysql = MySQL(app)