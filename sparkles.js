import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

async function initSparkles() {
    // Definir container
    const containerId = "tsparticles";
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.zIndex = "-1"; // Atrás do conteúdo
        container.style.pointerEvents = "none"; // Não bloquear cliques
        document.body.prepend(container);
    }

    // Configuração do Particles (adaptada do código React fornecido)
    const configs = {
        background: {
            color: {
                value: "transparent", // Fundo transparente para ver o gradiente CSS atrás
            },
        },
        fullScreen: {
            enable: false, // Vamos controlar o container manualmente
            zIndex: -1,
        },
        fpsLimit: 120,
        interactivity: {
            events: {
                onClick: {
                    enable: true,
                    mode: "push",
                },
                onHover: {
                    enable: false,
                    mode: "repulse",
                },
                resize: true,
            },
            modes: {
                push: {
                    quantity: 4,
                },
                repulse: {
                    distance: 200,
                    duration: 0.4,
                },
            },
        },
        particles: {
            bounce: {
                horizontal: { value: 1 },
                vertical: { value: 1 },
            },
            collisions: {
                enable: false,
            },
            color: {
                value: "#ffffff", // Cor das partículas
            },
            move: {
                enable: true,
                speed: { min: 0.1, max: 1 }, // Velocidade suave
                direction: "none",
                random: false,
                straight: false,
                outModes: {
                    default: "out",
                },
            },
            number: {
                density: {
                    enable: true,
                    width: 400,
                    height: 400,
                },
                value: 150, // Densidade
            },
            opacity: {
                value: { min: 0.1, max: 1 },
                animation: {
                    enable: true,
                    speed: 1, // Cintilação
                    sync: false,
                },
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 3 },
            },
        },
        detectRetina: true,
    };

    // Inicializar engine e carregar
    await loadSlim(tsParticles);

    await tsParticles.load({
        id: containerId,
        options: configs,
    });

    console.log("Sparkles initialized!");
}

// Iniciar
initSparkles().catch(console.error);
