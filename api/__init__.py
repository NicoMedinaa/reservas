from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)



app.config['SECRET_KEY'] = 'app_pass'

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/calendar')
def redirigir():

    return render_template('calendar.html')

import api.rouetes.categoriaTurnos
import api.rouetes.event
import api.rouetes.client
import api.utils

