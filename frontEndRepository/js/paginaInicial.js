document.addEventListener("DOMContentLoaded", () => {
            
            const SoundManager = {
                sounds: {},
                music: null,
                volume: 0.5,
                isMuted: false,
                isMusicPlaying: false,
                soundUrls: {
                    click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_2c63821366.mp3',
                    correct: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3b184b72f.mp3',
                    incorrect: 'https://cdn.pixabay.com/audio/2021/08/04/audio_a46cf2f010.mp3',
                    levelComplete: 'https://cdn.pixabay.com/audio/2022/08/31/audio_145d2e4684.mp3'
                },
                musicUrl: 'https://cdn.pixabay.com/audio/2024/05/13/audio_baf7a7f45a.mp3',
                init() {
                    this.isMuted = localStorage.getItem('abstrolab_muted') === 'true';
                    this.volume = parseFloat(localStorage.getItem('abstrolab_volume') || '0.5');
                    for (const key in this.soundUrls) {
                        this.sounds[key] = new Audio(this.soundUrls[key]);
                        this.sounds[key].volume = this.volume;
                    }
                    this.music = new Audio(this.musicUrl);
                    this.music.loop = true;
                    this.music.volume = this.volume;
                    if (this.isMuted) { this.mute(); }
                },
                play(soundName) {
                    if (!this.isMuted && this.sounds[soundName]) {
                        this.sounds[soundName].currentTime = 0;
                        this.sounds[soundName].play().catch(e => console.error("Erro ao tocar som:", e));
                    }
                },
                startMusic() {
                    if (!this.isMusicPlaying && !this.isMuted) {
                        const playPromise = this.music.play();
                        if (playPromise !== undefined) {
                            playPromise.then(_ => { this.isMusicPlaying = true; })
                                .catch(error => { console.log("Música aguardando interação do usuário para iniciar."); });
                        }
                    }
                },
                stopMusic() {
                    this.music.pause();
                    this.music.currentTime = 0;
                    this.isMusicPlaying = false;
                },
                setVolume(value) {
                    this.volume = value;
                    localStorage.setItem('abstrolab_volume', this.volume);
                    if (!this.isMuted) {
                         for (const key in this.sounds) { this.sounds[key].volume = this.volume; }
                        this.music.volume = this.volume;
                    }
                },
                toggleMute() {
                    this.isMuted = !this.isMuted;
                    localStorage.setItem('abstrolab_muted', this.isMuted);
                    this.isMuted ? this.mute() : this.unmute();
                    return this.isMuted;
                },
                mute() { for (const key in this.sounds) { this.sounds[key].volume = 0; }; this.music.volume = 0; },
                unmute() { this.setVolume(this.volume); }
            };
            SoundManager.init();

            const UI = {
                nomeUsuario: document.getElementById("nomeUsuario"),
                cardProximoExercicio: document.getElementById("card-proximo-exercicio"),
                statsCompletos: document.getElementById("stats-completos"),
                statsProgressoBarra: document.getElementById("stats-progresso-barra"),
                statsProgressoPercent: document.getElementById("stats-progresso-percent"),
                statsConquistas: document.getElementById("stats-conquistas"),
                btnSair: document.getElementById("btnSair"),
                navLinks: document.querySelectorAll(".nav-item"),
                renderUserInfo(usuario) { this.nomeUsuario.textContent = usuario.usuario_nome; },
                renderProximoExercicio(exercicio) {
                    if (exercicio && exercicio.exercicio_codigo) {
                        this.cardProximoExercicio.innerHTML = `
                            <h2>Continue de onde parou</h2>
                            <p>Seu próximo desafio é: <strong>${exercicio.titulo}</strong></p>
                            <button class="btn-continuar" data-codigo="${exercicio.exercicio_codigo}">Começar Exercício</button>
                        `;
                        const btnContinuar = this.cardProximoExercicio.querySelector('.btn-continuar');
                        btnContinuar.addEventListener('click', () => {
                            SoundManager.play('click');
                            window.location.href = `/exercicio?codigo=${btnContinuar.dataset.codigo}`;
                        });
                    } else {
                         this.cardProximoExercicio.innerHTML = `
                            <h2>Parabéns!</h2>
                            <p>Você completou todos os exercícios da trilha. Bom trabalho!</p>
                        `;
                        SoundManager.play('levelComplete');
                        SoundManager.stopMusic();
                    }
                },
                renderStats(progresso, totalExercicios) {
                    const numCompletos = progresso.length;
                    const percentual = totalExercicios > 0 ? Math.round((numCompletos / totalExercicios) * 100) : 0;
                    this.statsCompletos.textContent = numCompletos;
                    this.statsCompletos.classList.remove('skeleton', 'skeleton-text');
                    this.statsProgressoBarra.style.width = `${percentual}%`;
                    this.statsProgressoPercent.textContent = `${percentual}%`;
                    this.statsProgressoPercent.classList.remove('skeleton', 'skeleton-text');
                    this.statsConquistas.textContent = percentual > 50 ? '🏆🏅' : '🏆';
                    this.statsConquistas.classList.remove('skeleton', 'skeleton-text');
                },
                renderError(message) { this.cardProximoExercicio.innerHTML = `<p style="color: #c62828; font-weight: 600;">${message}</p>`; }
            };
            const API = {
                async fetchData(url) {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) {
                             const errorData = await response.json();
                             throw new Error(errorData.message || `Erro na rede: ${response.statusText}`);
                        }
                        const text = await response.text();
                        return text ? JSON.parse(text) : null;
                    } catch (error) {
                        console.error(`Falha ao buscar dados de ${url}:`, error);
                        UI.renderError(`Não foi possível carregar os dados. Tente novamente.`);
                        throw error;
                    }
                },
                getUsuario: (id) => API.fetchData(`/api/usuarios/${id}`),
                getProgresso: (id) => API.fetchData(`/api/progresso/${id}`),
                getExercicios: () => API.fetchData('/api/exercicios'),
                getProximoExercicio: (id) => API.fetchData(`/api/progresso/proximo/${id}`)
            };

            // --- Lógica de Inicialização ---
            const welcomeOverlay = document.getElementById('welcome-overlay');
            const startJourneyBtn = document.getElementById('btn-start-journey');

            async function initDashboardData() {
                const usuarioID = 1; 
                try {
                    const [usuario, progresso, exercicios, proximoExercicio] = await Promise.all([
                        API.getUsuario(usuarioID), API.getProgresso(usuarioID),
                        API.getExercicios(), API.getProximoExercicio(usuarioID)
                    ]);
                    if (usuario) UI.renderUserInfo(usuario);
                    if (progresso && exercicios) UI.renderStats(progresso, exercicios.length);
                    UI.renderProximoExercicio(proximoExercicio);
                } catch (error) {
                    console.error("Falha ao carregar dados do dashboard.", error);
                }
            }

            startJourneyBtn.addEventListener('click', () => {
                SoundManager.play('click');
                SoundManager.startMusic();
                welcomeOverlay.classList.add('hidden');
            });
            
            UI.btnSair.addEventListener('click', () => {
                SoundManager.play('click');
                if (confirm("Tem certeza que deseja sair?")) { window.location.href = 'cadastro.html'; }
            });
            UI.navLinks.forEach(link => {
                link.addEventListener('click', (e) => { SoundManager.play('click'); });
            });

            initDashboardData();
        });