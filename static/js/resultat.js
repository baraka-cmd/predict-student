/* ============================================ */
/* PREDICT'STUDENT - SCRIPTS PAGE RESULTAT      */
/* ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------- RECUPERATION DES DONNEES DEPUIS L'URL ---------- */
    const urlParams = new URLSearchParams(window.location.search);
    const note = parseFloat(urlParams.get('note')) || 0;
    const mention = urlParams.get('mention') || 'Inconnu';
    const conseil = urlParams.get('conseil') || 'Aucun conseil disponible.';

    /* ---------- RECUPERATION DES DONNEES DEPUIS LA VARIABLE DATA ---------- */
    const heuresEtude = DATA.heuresEtude || 0;
    const absences = DATA.absences || 0;
    const exercices = DATA.exercices || 0;
    const noteMiSemestre = DATA.noteMiSemestre || 0;

    /* ---------- ANIMATION DE LA JAUGE CIRCULAIRE ---------- */
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugeNote = document.getElementById('gauge-note');
    const gaugeLabel = document.getElementById('gauge-label');

    if (gaugeFill && gaugeNote && gaugeLabel) {
        const circumference = 2 * Math.PI * 85;
        const percentage = Math.min((note / 20) * 100, 100);
        const dashOffset = circumference - (circumference * percentage) / 100;

        gaugeFill.style.strokeDasharray = circumference;
        gaugeFill.style.strokeDashoffset = circumference;

        let mentionClass = '';
        if (note >= 16) {
            mentionClass = 'tres-bien';
        } else if (note >= 14) {
            mentionClass = 'bien';
        } else if (note >= 12) {
            mentionClass = 'assez-bien';
        } else if (note >= 10) {
            mentionClass = 'passable';
        } else {
            mentionClass = 'insuffisant';
        }

        gaugeFill.classList.add(mentionClass);

        setTimeout(function () {
            gaugeFill.style.strokeDashoffset = dashOffset;
        }, 300);

        animateCounter(gaugeNote, 0, note, 1500);
        gaugeLabel.textContent = mention;
    }

    /* ---------- ANIMATION COMPTEUR ---------- */
    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;
            element.textContent = current.toFixed(1);
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = end.toFixed(1);
            }
        }

        requestAnimationFrame(update);
    }

    /* ---------- MISE A JOUR DES DETAILS ---------- */
    const detailMention = document.getElementById('detail-mention');
    const detailConseil = document.getElementById('detail-conseil');
    if (detailMention) detailMention.textContent = mention;
    if (detailConseil) detailConseil.textContent = conseil;

    /* ---------- COULEUR DYNAMIQUE DE LA JAUGE ---------- */
    const gaugeCenter = document.querySelector('.gauge-center');
    if (gaugeCenter) {
        if (note >= 16) {
            gaugeCenter.style.color = '#0f9d58';
        } else if (note >= 14) {
            gaugeCenter.style.color = '#1a73e8';
        } else if (note >= 12) {
            gaugeCenter.style.color = '#f9a825';
        } else if (note >= 10) {
            gaugeCenter.style.color = '#ef6c00';
        } else {
            gaugeCenter.style.color = '#d93025';
        }
    }

    /* ============================================ */
    /* SYSTEME DE RECOMMANDATIONS DYNAMIQUES        */
    /* ============================================ */

    /* ---------- FONCTIONS DE DETERMINATION DU NIVEAU ---------- */
    function getNiveauEtude(heures) {
        if (heures >= 30) return 'excellent';
        if (heures >= 20) return 'bon';
        if (heures >= 10) return 'attention';
        return 'urgent';
    }

    function getNiveauPresence(abs) {
        if (abs <= 2) return 'excellent';
        if (abs <= 5) return 'bon';
        if (abs <= 10) return 'attention';
        return 'urgent';
    }

    function getNiveauExercices(ex) {
        if (ex >= 9) return 'excellent';
        if (ex >= 7) return 'bon';
        if (ex >= 4) return 'attention';
        return 'urgent';
    }

    function getNiveauTutorat(noteMS) {
        if (noteMS >= 16) return 'excellent';
        if (noteMS >= 12) return 'bon';
        if (noteMS >= 8) return 'attention';
        return 'urgent';
    }

    /* ---------- MESSAGES PAR NIVEAU ---------- */
    const messagesEtude = {
        excellent: "Rythme d'etude exemplaire. Vous etes dans le top des etudiants les plus assidus. Maintenez cette discipline.",
        bon: "Bon rythme d'etude. Pour viser l'excellence, essayez d'atteindre 30h par semaine.",
        attention: "Temps d'etude insuffisant. Visez au moins 20h par semaine pour consolider vos acquis.",
        urgent: "Temps d'etude critique. Sans augmentation immediate de vos heures, l'echec est quasi certain."
    };

    const messagesPresence = {
        excellent: "Assiduite parfaite. Cette presence reguliere est un facteur cle de reussite. Continuez ainsi.",
        bon: "Bonne assiduite. Essayez de viser le zero absence pour maximiser vos chances de reussite.",
        attention: "Absences preoccupantes. Chaque cours manque cree des lacunes difficiles a rattraper.",
        urgent: "Absenteisme critique. Le decrochage est imminent, une reprise urgente des cours est necessaire."
    };

    const messagesExercices = {
        excellent: "Pratique exemplaire. La regularite dans les exercices garantit une maitrise parfaite des notions.",
        bon: "Bonne regularite. Continuez a soumettre tous vos exercices pour progresser davantage.",
        attention: "Trop d'exercices non rendus. La pratique est essentielle pour assimiler les notions theoriques.",
        urgent: "Pratique quasi inexistante. Sans exercices reguliers, la theorie ne sera jamais maitrisee."
    };

    const messagesTutorat = {
        excellent: "Aucun besoin de tutorat. Votre niveau est excellent, continuez sur cette lancee.",
        bon: "Tutorat optionnel. Vous pourriez en beneficier pour atteindre l'excellence.",
        attention: "Tutorat recommande. Un accompagnement personnalise vous aiderait a combler vos lacunes.",
        urgent: "Tutorat obligatoire. Sans aide exterieure, la remontee de vos notes sera tres difficile."
    };

    /* ---------- LABELS DES NIVEAUX ---------- */
    const labelsNiveau = {
        excellent: 'Excellent',
        bon: 'Bon',
        attention: 'Attention',
        urgent: 'Urgent'
    };

    /* ---------- COULEURS DES BARRES ---------- */
    const couleursNiveau = {
        excellent: '#0f9d58',
        bon: '#1a73e8',
        attention: '#f9a825',
        urgent: '#d93025'
    };

    /* ---------- POURCENTAGES DES BARRES ---------- */
    function getPourcentageEtude(heures) {
        return Math.min((heures / 40) * 100, 100);
    }

    function getPourcentagePresence(absences) {
        return Math.min(Math.max(100 - (absences / 25) * 100, 0), 100);
    }

    function getPourcentageExercices(ex) {
        return Math.min((ex / 10) * 100, 100);
    }

    function getPourcentageTutorat(noteMS) {
        return Math.min((noteMS / 20) * 100, 100);
    }

    /* ---------- FONCTION D'APPLICATION D'UNE RECOMMANDATION ---------- */
    function appliquerRecommandation(id, niveau, message, valeur, pourcentage) {
        const item = document.getElementById('reco-' + id);
        const badge = document.getElementById('reco-' + id + '-badge');
        const text = document.getElementById('reco-' + id + '-text');
        const valueEl = document.getElementById('reco-' + id + '-value');
        const bar = document.getElementById('reco-' + id + '-bar');

        if (item) {
            item.className = 'reco-item niveau-' + niveau;
        }

        if (badge) {
            badge.textContent = labelsNiveau[niveau];
            badge.className = 'reco-badge ' + niveau;
        }

        if (text) {
            text.textContent = message;
        }

        if (valueEl) {
            valueEl.textContent = valeur;
        }

        if (bar) {
            bar.style.width = pourcentage + '%';
            bar.style.backgroundColor = couleursNiveau[niveau];
        }
    }

    /* ---------- CALCUL DES NIVEAUX ---------- */
    const niveauEtude = getNiveauEtude(heuresEtude);
    const niveauPresence = getNiveauPresence(absences);
    const niveauExercices = getNiveauExercices(exercices);
    const niveauTutorat = getNiveauTutorat(noteMiSemestre);

    /* ---------- CALCUL DES POURCENTAGES ---------- */
    const pourcentageEtude = getPourcentageEtude(heuresEtude);
    const pourcentagePresence = getPourcentagePresence(absences);
    const pourcentageExercices = getPourcentageExercices(exercices);
    const pourcentageTutorat = getPourcentageTutorat(noteMiSemestre);

    /* ---------- APPLICATION DES RECOMMANDATIONS ---------- */
    appliquerRecommandation('etude', niveauEtude, messagesEtude[niveauEtude], heuresEtude, pourcentageEtude);
    appliquerRecommandation('presence', niveauPresence, messagesPresence[niveauPresence], absences, pourcentagePresence);
    appliquerRecommandation('exercices', niveauExercices, messagesExercices[niveauExercices], exercices, pourcentageExercices);
    appliquerRecommandation('tutorat', niveauTutorat, messagesTutorat[niveauTutorat], noteMiSemestre, pourcentageTutorat);

    /* ============================================ */
    /* FIN DU SYSTEME DE RECOMMANDATIONS            */
    /* ============================================ */

    /* ---------- ANIMATION D'ENTREE DES CARTES ---------- */
    const cards = document.querySelectorAll('.result-main-card, .interpretation-card, .recommendations-card');
    
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, index) {
            if (entry.isIntersecting) {
                setTimeout(function () {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    cards.forEach(function (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

    /* ---------- ANIMATION DES BARRES DE PROGRESSION ---------- */
    setTimeout(function () {
        const bars = document.querySelectorAll('.reco-bar-fill');
        bars.forEach(function (bar) {
            bar.style.transition = 'width 1.2s ease';
        });
    }, 400);

    /* ---------- SAUVEGARDE DANS L'HISTORIQUE LOCAL ---------- */
const urlParamsForHistory = new URLSearchParams(window.location.search);

const prediction = {
    note: note,
    mention: mention,
    conseil: conseil,
    heuresEtude: heuresEtude,
    absences: absences,
    exercices: exercices,
    noteMiSemestre: noteMiSemestre,
    age: urlParamsForHistory.get('age') || '-',
    genre: urlParamsForHistory.get('genre') || '-',
    bourse: urlParamsForHistory.get('bourse') || '-',
    niveauParents: urlParamsForHistory.get('niveau_parents') || '-',
    heuresSommeil: urlParamsForHistory.get('heures_sommeil') || '0',
    travail: urlParamsForHistory.get('travail') || '-',
    internet: urlParamsForHistory.get('internet') || '-',
    participation: urlParamsForHistory.get('participation') || '0',
    tutorat: urlParamsForHistory.get('tutorat') || '-',
    activite: urlParamsForHistory.get('activite') || '-',
    date: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
};
    let history = JSON.parse(localStorage.getItem('predictStudent_history')) || [];

    history.unshift(prediction);

    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    localStorage.setItem('predictStudent_history', JSON.stringify(history));

    /* ---------- CONFETTI POUR EXCELLENCE ---------- */
    if (note >= 16) {
        createConfetti();
    }

    function createConfetti() {
        const colors = ['#0f9d58', '#1a73e8', '#f9a825', '#ea4335', '#ff6d00', '#aa00ff'];
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9999';
        document.body.appendChild(container);

        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = Math.random() * 12 + 6 + 'px';
            confetti.style.height = Math.random() * 12 + 6 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = -(Math.random() * 100 + 20) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.opacity = Math.random() * 0.7 + 0.3;

            const duration = Math.random() * 3 + 3;
            const delay = Math.random() * 2;

            confetti.style.animation = 'confettiFall ' + duration + 's ease-in ' + delay + 's forwards';

            container.appendChild(confetti);
        }

        setTimeout(function () {
            document.body.removeChild(container);
        }, 6000);
    }

    /* ---------- ANIMATION CONFETTI KEYFRAMES ---------- */
    const confettiStyle = document.createElement('style');
    confettiStyle.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg) scale(1);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg) scale(0.3);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(confettiStyle);

    /* ---------- IMPRESSION ---------- */
    window.addEventListener('beforeprint', function () {
        const actions = document.querySelector('.result-actions');
        if (actions) {
            actions.style.display = 'none';
        }
    });

    window.addEventListener('afterprint', function () {
        const actions = document.querySelector('.result-actions');
        if (actions) {
            actions.style.display = 'flex';
        }
    });

});