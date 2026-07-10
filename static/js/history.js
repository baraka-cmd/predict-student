/* ============================================ */
/* PREDICT'STUDENT - SCRIPTS PAGE HISTORIQUE    */
/* ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------- ELEMENTS DU DOM ---------- */
    const historyTbody = document.getElementById('history-tbody');
    const historyEmpty = document.getElementById('history-empty');
    const historyCount = document.getElementById('history-count');
    const historyTable = document.getElementById('history-table');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const detailModal = document.getElementById('detail-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCloseBtn2 = document.getElementById('modal-close-btn2');

    /* ---------- CHARGEMENT DE L'HISTORIQUE ---------- */
    let history = JSON.parse(localStorage.getItem('predictStudent_history')) || [];

    function afficherHistorique() {
        if (history.length === 0) {
            historyTable.parentElement.style.display = 'none';
            historyEmpty.style.display = 'block';
            document.getElementById('history-counter').style.display = 'none';
            return;
        }

        historyTable.parentElement.style.display = 'block';
        historyEmpty.style.display = 'none';
        document.getElementById('history-counter').style.display = 'flex';
        historyCount.textContent = history.length;

        historyTbody.innerHTML = '';

        history.forEach(function (prediction, index) {
            const row = document.createElement('tr');
            row.setAttribute('data-index', index);

            let mentionClass = '';
            const note = prediction.note;
            if (note >= 16) mentionClass = 'tres-bien';
            else if (note >= 14) mentionClass = 'bien';
            else if (note >= 12) mentionClass = 'assez-bien';
            else if (note >= 10) mentionClass = 'passable';
            else mentionClass = 'insuffisant';

            const heuresEtude = prediction.heuresEtude || 0;
            const absences = prediction.absences || 0;
            const exercices = prediction.exercices || 0;
            const noteMiSemestre = prediction.noteMiSemestre || 0;

            row.innerHTML = `
                <td>${prediction.date || '-'}</td>
                <td><strong>${note.toFixed(1)}/20</strong></td>
                <td><span class="table-badge ${mentionClass}">${prediction.mention || '-'}</span></td>
                <td>${heuresEtude} h</td>
                <td>${absences} j</td>
                <td>${exercices}/10</td>
                <td>${noteMiSemestre}/20</td>
                <td>
                    <button class="btn-detail" data-index="${index}" title="Voir le détail">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;

            historyTbody.appendChild(row);
        });

        document.querySelectorAll('.btn-detail').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                ouvrirModale(index);
            });
        });
    }

    /* ---------- OUVERTURE MODALE ---------- */
    function ouvrirModale(index) {
        const prediction = history[index];
        if (!prediction) return;

        document.getElementById('modal-date').textContent = prediction.date || '-';
        document.getElementById('modal-mention').textContent = prediction.mention || '-';
        document.getElementById('modal-conseil').textContent = prediction.conseil || '-';

        const note = prediction.note || 0;
        document.getElementById('modal-note').textContent = note.toFixed(1);

        const gaugeFill = document.getElementById('modal-gauge-fill');
        const circumference = 2 * Math.PI * 75;
        const percentage = Math.min((note / 20) * 100, 100);
        const dashOffset = circumference - (circumference * percentage) / 100;

        gaugeFill.style.strokeDasharray = circumference;
        gaugeFill.style.strokeDashoffset = dashOffset;

        if (note >= 16) gaugeFill.style.stroke = '#0f9d58';
        else if (note >= 14) gaugeFill.style.stroke = '#1a73e8';
        else if (note >= 12) gaugeFill.style.stroke = '#f9a825';
        else if (note >= 10) gaugeFill.style.stroke = '#ef6c00';
        else gaugeFill.style.stroke = '#d93025';

        const detailsGrid = document.getElementById('modal-details-grid');
        detailsGrid.innerHTML = '';

        const champs = [
            { label: 'Âge', valeur: prediction.age || '-' },
            { label: 'Genre', valeur: prediction.genre || '-' },
            { label: 'Bourse', valeur: prediction.bourse || '-' },
            { label: 'Niveau des parents', valeur: prediction.niveauParents || '-' },
            { label: 'Heures d\'étude/semaine', valeur: (prediction.heuresEtude || 0) + ' h' },
            { label: 'Heures de sommeil/semaine', valeur: (prediction.heuresSommeil || 0) + ' h' },
            { label: 'Absences totales', valeur: (prediction.absences || 0) + ' jours' },
            { label: 'Travail extrascolaire', valeur: prediction.travail || '-' },
            { label: 'Accès Internet', valeur: prediction.internet || '-' },
            { label: 'Note mi-semestre', valeur: (prediction.noteMiSemestre || 0) + '/20' },
            { label: 'Exercices soumis', valeur: (prediction.exercices || 0) + '/10' },
            { label: 'Participation cours', valeur: (prediction.participation || 0) + '/10' },
            { label: 'Tutorat', valeur: prediction.tutorat || '-' },
            { label: 'Activité physique', valeur: prediction.activite || '-' }
        ];

        champs.forEach(function (champ) {
            const item = document.createElement('div');
            item.className = 'modal-detail-item';
            item.innerHTML = `
                <span class="detail-key">${champ.label}</span>
                <span class="detail-val">${champ.valeur}</span>
            `;
            detailsGrid.appendChild(item);
        });

        detailModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /* ---------- FERMETURE MODALE ---------- */
    function fermerModale() {
        detailModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    modalCloseBtn.addEventListener('click', fermerModale);
    modalCloseBtn2.addEventListener('click', fermerModale);

    detailModal.addEventListener('click', function (e) {
        if (e.target === detailModal) {
            fermerModale();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && detailModal.style.display === 'flex') {
            fermerModale();
        }
    });

    /* ---------- EXPORT CSV ---------- */
    exportCsvBtn.addEventListener('click', function () {
        if (history.length === 0) {
            alert('Aucune prédiction à exporter.');
            return;
        }

        let csv = 'Date,Note,Mention,Heures étude,Absences,Exercices,Note mi-semestre\n';

        history.forEach(function (p) {
            csv += `"${p.date || '-'}",${(p.note || 0).toFixed(1)},${p.mention || '-'},${p.heuresEtude || 0},${p.absences || 0},${p.exercices || 0},${p.noteMiSemestre || 0}\n`;
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'historique_predictions.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    /* ---------- EFFACER HISTORIQUE ---------- */
    clearHistoryBtn.addEventListener('click', function () {
        if (history.length === 0) return;

        const confirmation = confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ? Cette action est irréversible.');
        if (!confirmation) return;

        localStorage.removeItem('predictStudent_history');
        history = [];
        afficherHistorique();
    });

    /* ---------- INITIALISATION ---------- */
    afficherHistorique();
});