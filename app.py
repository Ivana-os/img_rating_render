from flask import Flask, request, jsonify, render_template
import psycopg2
import os
from datetime import datetime

app = Flask(__name__)

# Konekcija na PostgreSQL bazu (Render koristi DATABASE_URL iz env varijabli)
conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
cursor = conn.cursor()

# 🧱 Kreiranje tablice ako ne postoji
cursor.execute("""
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    image_index INTEGER,
    time TIMESTAMP,
    folder1 INTEGER,
    folder2 INTEGER,
    folder3 INTEGER
)
""")
conn.commit()

# Glavna stranica (index.html mora biti u templates/)
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint za spremanje ocjena
@app.route('/rate', methods=['POST'])
def rate():
    data = request.get_json()
    index = data.get('index')
    ratings = data.get('ratings', {})
    now = datetime.now()

    cursor.execute("""
        INSERT INTO ratings (image_index, time, folder1, folder2, folder3)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        index,
        now,
        ratings.get('folder1'),
        ratings.get('folder2'),
        ratings.get('folder3')
    ))
    conn.commit()
    return jsonify(message="Ocjena spremljena u bazu")

#Stranica za pregled rezultata (ako je imaš)
@app.route('/results-view')
def results_view():
    return render_template('results.html')

if __name__ == '__main__':
    app.run(debug=True)
