import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.token import token_bp
from src.routes.connectionDetails import connectionDetails_bp
from src.routes.voice import voice_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600
)

# Register blueprints
app.register_blueprint(token_bp)
app.register_blueprint(connectionDetails_bp)
app.register_blueprint(voice_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
