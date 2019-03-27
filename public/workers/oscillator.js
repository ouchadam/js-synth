
export default class Oscillator {

    sampleIndex = 0
    sampleRate = 44100

    source(oscillator, noteFreq) {
        if (oscillator.enabled) {
            return this.generateSound(oscillator, noteFreq) * oscillator.gain
        } else {
            return 0
        }
    }

    generateSound(oscillator, noteFreq) {
        switch (oscillator.type) {
            case "SINE":
                return this.sineGenerator(noteFreq, this.sampleRate, this.sampleIndex)
            case "SAWTOOTH":
                return this.sawGenerator(noteFreq, this.sampleRate, this.sampleIndex)
            case "SQUARE":
                return this.squareGenerator(noteFreq, this.sampleRate, this.sampleIndex)
            case "TRIANGLE":
                return this.triangleGenerator(noteFreq, this.sampleRate, this.sampleIndex)
            case "NOISE":
                return this.noiseGenerator()
            default:
                return 0
        }
    }

    sineGenerator(frequency, sampleRate, position) {
        const f = sampleRate / frequency
        const ft = (position % f) / f
        return Math.sin(2 * Math.PI * ft)
    }

    squareGenerator(noteFreq, sampleRate, position) {
        const sine = this.sineGenerator(noteFreq, sampleRate, position)
        return Math.sign(sine)
    }

    sawGenerator(frequency, sampleRate, position) {
        const f = sampleRate / frequency
        const ft = (position % f) / f
        return 2 * ft - 1
    }

    triangleGenerator(noteFreq, sampleRate, position) {
        const saw = this.sawGenerator(noteFreq, sampleRate, position)
        return Math.abs(saw) * 2 - 1
    }

    noiseGenerator() {
        return (Math.random() * 2) - 1
    }

    reset() {
        this.sampleIndex = 0
    }

    incrementPosition() {
        this.sampleIndex++
    }

}