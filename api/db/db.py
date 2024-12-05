from api import app
import pymysql

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'admin'# nombre dew usuario elejido
app.config['MYSQL_PASSWORD'] ='432287' # contra elejida
app.config['MYSQL_DB'] = 'sistemareservas'
app.config['STATIC_FOLDER'] = 'static' # para servir tu aplicación web y necesitas servir archivos estáticos

def get_db_connection():
    return pymysql.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB']
    )