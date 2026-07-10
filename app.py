# ============================================
# PREDICT'STUDENT - APPLICATION FLASK
# ============================================
from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELE_PATH = os.path.join(BASE_DIR, 'models', 'modele_final.pkl')
PREPROCESSEUR_PATH = os.path.join(BASE_DIR, 'models', 'preprocesseur.pkl')

COLONNES_ORDRE = [
    'Age', 'Genre', 'Bourse', 'Niveau_Parents', 'Heures_Etude_Semaine',
    'Heures_Sommeil_Semaine', 'Absences_Total', 'Travail_Extrascolaire',
    'Acces_Internet', 'Note_Mi_Semestre', 'Exercices_Soumis',
    'Participation_Cours', 'Tutorat', 'Activite_Physique'
]

modele = joblib.load(MODELE_PATH)
preprocesseur = joblib.load(PREPROCESSEUR_PATH)

print("Modele et preprocesseur charges avec succes.")

@app.route('/')
def accueil():
    return render_template('index.html')

@app.route('/formulaire')
def formulaire():
    return render_template('formulaire.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        input_dict = {col: data[col] for col in COLONNES_ORDRE}
        input_df = pd.DataFrame([input_dict])

        input_transformee = preprocesseur.transform(input_df)

        note_predite = float(modele.predict(input_transformee)[0])
        note_predite = round(min(max(note_predite, 0), 20), 1)

        if note_predite >= 16:
            mention = 'Tres Bien'
            conseil = 'Excellent travail. Continuez sur cette voie.'
        elif note_predite >= 14:
            mention = 'Bien'
            conseil = 'Bon niveau. Quelques efforts supplementaires pour viser lexcellence.'
        elif note_predite >= 12:
            mention = 'Assez Bien'
            conseil = 'Niveau correct. Renforcez la regularite dans les exercices.'
        elif note_predite >= 10:
            mention = 'Passable'
            conseil = 'Des lacunes identifiees. Un suivi personnalise est recommande.'
        else:
            mention = 'Insuffisant'
            conseil = 'Risque dechec. Mettez en place un plan de soutien rapidement.'

        return jsonify({
            'note': note_predite,
            'mention': mention,
            'conseil': conseil,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/resultat')
def resultat():
    note = request.args.get('note', '0')
    mention = request.args.get('mention', '')
    conseil = request.args.get('conseil', '')
    heures_etude = request.args.get('heures_etude', '0')
    absences = request.args.get('absences', '0')
    exercices = request.args.get('exercices', '0')
    note_ms = request.args.get('note_ms', '0')
    return render_template('resultat.html',
                         note=note, mention=mention, conseil=conseil,
                         heures_etude=heures_etude, absences=absences,
                         exercices=exercices, note_ms=note_ms)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)