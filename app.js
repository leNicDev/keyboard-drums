// The Web Audio API context
let context;

// Object containing all samples of the current kit
let samples = {};


function playSample(sample) {
    const source = context.createBufferSource();
    source.buffer = sample;
    source.connect(context.destination);
    source.start(0);
}

async function init() {
    try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new AudioContext();
    } catch(e) {
        alert('Web Audio API is not supported in this browser');
        return;
    }

    // Load the default kit
    const kit = await loadKit('default');

    // Initialize the kit
    await initKit(kit);

    // Start handling key events
    handleKeyEvents();
}


function handleKeyEvents() {
    document.addEventListener('keydown', (event) => {
        // Key is not defined
        if (!samples[event.key]) {
            return;
        }

        // Play the sample
        playSample(samples[event.key]);
    });
}

async function loadKit(id) {
    const response = await fetch(`./kits/${id}.json`);
    return response.json();
}

async function getSampleFile(src) {
    const response = await fetch(src);
    return response.arrayBuffer();
}

async function initKit(kit) {
    for (const sampleName in kit.samples) {
        const sample = kit.samples[sampleName];
        const sampleData = await getSampleFile(sample.url);

        context.decodeAudioData(sampleData, (buffer) => {
            samples[sample.key] = buffer;
        }, (err) => {
            console.error('Failed to load sample', err);
        });
    }
}

init().then();