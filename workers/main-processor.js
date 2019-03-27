import BiQuadFilter from './biquad-filter.js'
import Delay from './delay.js'
import Reverb from './reverb.js'
import Oscillator from './oscillator.js'
import Envelope from './envelope.js'

class MainProcessor extends AudioWorkletProcessor {

    reverb = new Reverb()
    delay = new Delay()
    envelope = new Envelope()

    filters = {
        one: new BiQuadFilter(),
        two: new BiQuadFilter(),
        three: new BiQuadFilter(),
        reset: () => {
            this.filters.one.reset()
            this.filters.two.reset()
            this.filters.three.reset()
        }
    }

    oscillators = {
        one: new Oscillator(),
        two: new Oscillator(),
        three: new Oscillator(),
        increment: () => {
            this.oscillators.one.incrementPosition()
            this.oscillators.two.incrementPosition()
            this.oscillators.three.incrementPosition()
        }
    }

    constructor() {
        super();
        this.sampleRate = 44100
        this.state = {
            oscillators: {
                one: {
                    enabled: true,
                    type: 'SINE',
                    gain: 0.5
                },
                two: {
                    enabled: false,
                    type: 'SINE',
                    gain: 0.5
                },
                three: {
                    enabled: false,
                    type: 'SINE',
                    gain: 0.5
                }
            },
            effects: {
                delay: {
                    enabled: false,
                    amount: 44100,
                    mix: 0.5,
                    feedback: 0.6
                },
                reverb: {
                    enabled: false,
                    amount: 1,
                    mix: 0.5
                }
            },
            filters: {
                one: {
                    type: 'LOWPASS',
                    enabled: false,
                    cutoff: 44100 / 2,
                    resonance: 0
                },
                two: {
                    type: 'HIGHPASS',
                    enabled: false,
                    cutoff: 0,
                    resonance: 0
                },
                three: {
                    type: 'ALLPASS',
                    enabled: false,
                    cutoff: 0,
                    resonance: 0
                }
            },
            master: {
                enabled: true,
                gain: 0.5
            },
            envelope: {
                attack: {
                    amount: 650,
                    level: 1
                },
                sustain: {
                    level: 1
                },
                release: {
                    amount: 650
                }
            }
        }
        this.port.onmessage = (event) => {
            switch (event.data.type) {
                case "NOTE_ON":
                    this.state.note = event.data.payload
                    this.envelope.noteStart()
                    break

                case "NOTE_OFF":
                    this.envelope.noteEnd()
                    break

                case "OSC_CHANGE_ENABLED": {
                    const { oscId, enabled } = event.data.payload
                    this.state.oscillators[oscId].enabled = enabled
                    break
                }

                case "OSC_CHANGE": {
                    const { oscId, type } = event.data.payload
                    this.state.oscillators[oscId].type = type
                    break
                }

                case "OSC_CHANGE_GAIN": {
                    const { oscId, gain } = event.data.payload
                    this.state.oscillators[oscId].gain = gain
                    break
                }

                case "MASTER_CHANGE_GAIN":
                    this.state.master.gain = event.data.payload
                    break

                case "MASTER_CHANGE_ENABLED":
                    this.state.master.enabled = event.data.payload
                    break

                case "FILTER_ENABLED": {
                    const { filterId, enabled } = event.data.payload
                    this.state.filters[filterId].enabled = enabled
                    this.filters[filterId].reset()
                    this.filters[filterId].update(this.sampleRate, this.state.filters[filterId])
                    break
                }

                case "FILTER_CHANGE_TYPE": {
                    const { filterId, type } = event.data.payload
                    this.state.filters[filterId].type = type
                    this.filters[filterId].reset()
                    this.filters[filterId].update(this.sampleRate, this.state.filters[filterId])
                    break
                }

                case "FILTER_CUTOFF": {
                    const { filterId, cutoff } = event.data.payload
                    this.state.filters[filterId].cutoff = cutoff
                    this.filters[filterId].update(this.sampleRate, this.state.filters[filterId])
                    break
                }

                case "FILTER_RESONANCE": {
                    const { filterId, resonance } = event.data.payload
                    this.state.filters[filterId].resonance = resonance
                    this.filters[filterId].update(this.sampleRate, this.state.filters[filterId])
                    break
                }

                case "DELAY_CHANGE_ENABLED": {
                    this.state.effects.delay.enabled = event.data.payload
                    this.delay.update(this.state.effects.delay.amount)
                    this.delay.reset()
                    break
                }

                case "DELAY_CHANGE_AMOUNT": {
                    this.state.effects.delay.amount = event.data.payload
                    this.delay.update(this.state.effects.delay.amount)
                    break
                }

                case "DELAY_CHANGE_FEEDBACK": {
                    this.state.effects.delay.feedback = event.data.payload
                    break
                }

                case "DELAY_CHANGE_MIX": {
                    this.state.effects.delay.mix = event.data.payload
                    break
                }

                case "REVERB_CHANGE_ENABLED": {
                    this.state.effects.reverb.enabled = event.data.payload
                    this.reverb.update(this.state.effects.reverb.amount)
                    break
                }

                case "REVERB_CHANGE_AMOUNT": {
                    this.state.effects.reverb.amount = event.data.payload
                    this.reverb.update(this.state.effects.reverb.amount)
                    break
                }

                case "REVERB_CHANGE_MIX": {
                    this.state.effects.reverb.mix = event.data.payload
                    break
                }
            }
        }
    }

    process(_, outputs) {
        if (!this.state.master.enabled) {
            return true
        }
        const outputBuffer = outputs[0][0]
        let source = 0

        if (!this.state.note) return true

        for (let bufferIndex = 0; bufferIndex < outputBuffer.length; bufferIndex++) {
            source = this.oscillators.one.source(this.state.oscillators.one, this.state.note)
            source += this.oscillators.two.source(this.state.oscillators.two, this.state.note)
            source += this.oscillators.three.source(this.state.oscillators.three, this.state.note)
            source = this.envelope.process(source, this.state.envelope)
            this.incrementSampleIndex()

            source = this.effect(source)
            source = this.filter(source, "one")
            source = this.filter(source, "two")
            source = this.filter(source, "three")
            source = source * this.state.master.gain

            if (Math.abs(source) > 1) {
                source = 0
            }

            outputBuffer[bufferIndex] = source;
        }
        return true
    }

    incrementSampleIndex() {
        this.oscillators.increment()
    }

    filter(input, filterId) {
        if (this.state.filters[filterId].enabled) {
            return this.filters[filterId].process(input)
        } else {
            return input
        }
    }

    effect(input) {
        let output = input
        if (this.state.effects.delay.enabled) {
            output = this.delay.process(input, this.state.effects.delay.feedback, this.state.effects.delay.mix)
        }
        if (this.state.effects.reverb.enabled) {
            output = this.reverb.process(output, this.state.effects.reverb)
        }
        return output
    }
}

registerProcessor('main-processor', MainProcessor);
