/* ============================================ */
/* PREDICT'STUDENT - SCRIPTS PAGE FORMULAIRE    */
/* ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('submit-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');

    const sliders = [
        { id: 'Heures_Etude_Semaine', display: 'Heures_Etude_Semaine_val' },
        { id: 'Heures_Sommeil_Semaine', display: 'Heures_Sommeil_Semaine_val' },
        { id: 'Note_Mi_Semestre', display: 'Note_Mi_Semestre_val' },
        { id: 'Participation_Cours', display: 'Participation_Cours_val' }
    ];

    sliders.forEach(function (slider) {
        var input = document.getElementById(slider.id);
        var display = document.getElementById(slider.display);
        if (input && display) {
            input.addEventListener('input', function () {
                display.textContent = this.value;
            });
        }
    });

    window.addEventListener('scroll', function () {
        var sections = document.querySelectorAll('.form-section');
        var currentSection = 1;
        sections.forEach(function (section, index) {
            var rect = section.getBoundingClientRect();
            if (rect.top <= 200) currentSection = index + 1;
        });
        updateProgress(currentSection);
    });

    function updateProgress(currentStep) {
        progressSteps.forEach(function (step, index) {
            var stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            if (stepNumber < currentStep) step.classList.add('completed');
            else if (stepNumber === currentStep) step.classList.add('active');
        });
        progressLines.forEach(function (line, index) {
            if (index + 1 < currentStep) line.classList.add('completed');
            else line.classList.remove('completed');
        });
    }

    progressSteps.forEach(function (step) {
        step.addEventListener('click', function () {
            var stepNumber = parseInt(this.getAttribute('data-step'));
            var targetSection = document.getElementById('section-' + stepNumber);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    function validateForm() {
        var age = parseInt(document.getElementById('Age').value);
        var absences = parseInt(document.getElementById('Absences_Total').value);
        var exercices = parseInt(document.getElementById('Exercices_Soumis').value);
        if (isNaN(age) || age < 18 || age > 30) { showError('Age invalide (18-30 ans).'); return false; }
        if (isNaN(absences) || absences < 0 || absences > 25) { showError('Absences invalides (0-25).'); return false; }
        if (isNaN(exercices) || exercices < 0 || exercices > 10) { showError('Exercices invalides (0-10).'); return false; }
        var selects = document.querySelectorAll('select[required]');
        for (var i = 0; i < selects.length; i++) {
            if (selects[i].value === '') { showError('Veuillez remplir tous les champs.'); return false; }
        }
        return true;
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        setTimeout(function () { errorMessage.style.display = 'none'; }, 4000);
    }

    function envoyer() {
        if (!validateForm()) return;

        loadingSpinner.style.display = 'flex';
        submitBtn.disabled = true;

        var formData = {
            Age: parseInt(document.getElementById('Age').value),
            Genre: document.getElementById('Genre').value,
            Bourse: document.getElementById('Bourse').value,
            Niveau_Parents: document.getElementById('Niveau_Parents').value,
            Heures_Etude_Semaine: parseFloat(document.getElementById('Heures_Etude_Semaine').value),
            Heures_Sommeil_Semaine: parseFloat(document.getElementById('Heures_Sommeil_Semaine').value),
            Absences_Total: parseInt(document.getElementById('Absences_Total').value),
            Travail_Extrascolaire: document.getElementById('Travail_Extrascolaire').value,
            Acces_Internet: document.getElementById('Acces_Internet').value,
            Note_Mi_Semestre: parseFloat(document.getElementById('Note_Mi_Semestre').value),
            Exercices_Soumis: parseInt(document.getElementById('Exercices_Soumis').value),
            Participation_Cours: parseFloat(document.getElementById('Participation_Cours').value),
            Tutorat: document.getElementById('Tutorat').value,
            Activite_Physique: document.getElementById('Activite_Physique').value
        };

        fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(function (response) { return response.json(); })
        .then(function (data) {
            loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
            if (data.status === 'success') {
                var params = new URLSearchParams({
                    note: data.note,
                    mention: data.mention,
                    conseil: data.conseil,
                    heures_etude: formData.Heures_Etude_Semaine,
                    absences: formData.Absences_Total,
                    exercices: formData.Exercices_Soumis,
                    note_ms: formData.Note_Mi_Semestre,
                    age: formData.Age,
                    genre: formData.Genre,
                    bourse: formData.Bourse,
                    niveau_parents: formData.Niveau_Parents,
                    heures_sommeil: formData.Heures_Sommeil_Semaine,
                    travail: formData.Travail_Extrascolaire,
                    internet: formData.Acces_Internet,
                    participation: formData.Participation_Cours,
                    tutorat: formData.Tutorat,
                    activite: formData.Activite_Physique
                });
                window.location.href = '/resultat?' + params.toString();
            } else {
                showError(data.message || 'Erreur serveur.');
            }
        })
        .catch(function () {
            loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
            showError('Erreur reseau. Verifiez votre connexion.');
        });
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); envoyer(); });
    submitBtn.addEventListener('click', function (e) { e.preventDefault(); envoyer(); });
    submitBtn.addEventListener('touchend', function (e) { e.preventDefault(); envoyer(); });

    var allInputs = document.querySelectorAll('input, select');
    allInputs.forEach(function (input) {
        input.addEventListener('change', function () {
            var formState = {};
            allInputs.forEach(function (el) {
                if (el.type === 'range' || el.type === 'number' || el.type === 'select-one') {
                    formState[el.id || el.name] = el.value;
                }
            });
            localStorage.setItem('predictStudent_formDraft', JSON.stringify(formState));
        });
    });

    var savedDraft = localStorage.getItem('predictStudent_formDraft');
    if (savedDraft) {
        var formState = JSON.parse(savedDraft);
        Object.keys(formState).forEach(function (key) {
            var el = document.getElementById(key) || document.querySelector('[name="' + key + '"]');
            if (el) {
                el.value = formState[key];
                var displayEl = document.getElementById(key + '_val');
                if (displayEl) displayEl.textContent = formState[key];
            }
        });
    }

});

function resetForm() {
    document.getElementById('prediction-form').reset();
    var slidersReset = [
        { id: 'Heures_Etude_Semaine', display: 'Heures_Etude_Semaine_val', val: '15' },
        { id: 'Heures_Sommeil_Semaine', display: 'Heures_Sommeil_Semaine_val', val: '49' },
        { id: 'Note_Mi_Semestre', display: 'Note_Mi_Semestre_val', val: '10' },
        { id: 'Participation_Cours', display: 'Participation_Cours_val', val: '5' }
    ];
    slidersReset.forEach(function (item) {
        var display = document.getElementById(item.display);
        if (display) display.textContent = item.val;
    });
    localStorage.removeItem('predictStudent_formDraft');
    document.getElementById('error-message').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}