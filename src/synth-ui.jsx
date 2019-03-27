import React from 'react';
import { RadioGroup, Radio } from 'react-radio-group'
import { Knob } from 'react-rotary-knob'

const BOX_STYLE = {
    borderStyle: 'solid',
    padding: '10px',
    color: 'white',
    margin: '5px'
}

export default class SynthUI extends React.Component {

    state = {
        oscillators: {
            one: {
                enabled: true,
                type: "SINE",
                gain: 0.5
            },
            two: {
                enabled: false,
                type: "SINE",
                gain: 0.5
            },
            three: {
                enabled: false,
                type: "SINE",
                gain: 0.5
            }
        },
        filters: {
            one: {
                type: "LOWPASS",
                enabled: false,
                cutoff: 44100 / 2,
                resonance: 0
            },
            two: {
                type: "HIGHPASS",
                enabled: false,
                cutoff: 0,
                resonance: 0
            },
            three: {
                type: "ALLPASS",
                enabled: false,
                cutoff: 0,
                resonance: 0
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
        master: {
            enabled: true,
            gain: 0.5
        }
    }

    render() {
        return (
            <div style={{ display: 'flex' }}>
                <Oscillators
                    value={this.state.oscillators}
                    onChangeGain={this._changeOscGain.bind(this)}
                    onChangeType={this._changeOscType.bind(this)}
                    onChangeEnabled={this._changeOscEnabled.bind(this)}
                />
                <Filters
                    value={this.state.filters}
                    onChangeEnabled={this._changeFilterEnabled.bind(this)}
                    onChangeType={this._changeFilterType.bind(this)}
                    onChangeCutoff={this._changeFilterCutoff.bind(this)}
                    onChangeResonance={this._changeFilterResonance.bind(this)}
                />
                <div>
                    <div style={{ color: 'white', textAlign: 'right', paddingRight: '10px' }}>Effects</div>
                    <Delay
                        value={this.state.effects.delay}
                        onChangeEnabled={this._changeDelayEnabled.bind(this)}
                        onChangeAmount={this._changeDelayAmount.bind(this)}
                        onChangeFeedback={this._changeDelayFeedback.bind(this)}
                        onChangeMix={this._changeDelayMix.bind(this)}
                    />
                    <Reverb
                        value={this.state.effects.reverb}
                        onChangeEnabled={this._changeReverbEnabled.bind(this)}
                        onChangeAmount={this._changeReverbAmount.bind(this)}
                        onChangeMix={this._changeReverbMix.bind(this)}
                    />
                </div>
                <Master
                    value={this.state.master}
                    onChangeGain={this._changeMasterGain.bind(this)}
                    onChangeEnabled={this._changeMasterEnabled.bind(this)}
                />
            </div>
        )
    }

    _changeOscType = (oscId) => (type) => {
        this.postMessage({
            type: "OSC_CHANGE",
            payload: { oscId, type }
        })
        const oscillator = this.state.oscillators[oscId]
        this.setState({ oscillators: { ...this.state.oscillators, [oscId]: { ...oscillator, type } } })
    }

    _changeOscGain = (oscId) => (gain) => {
        this.postMessage({
            type: "OSC_CHANGE_GAIN",
            payload: { oscId, gain }
        })
        const oscillator = this.state.oscillators[oscId]
        this.setState({ oscillators: { ...this.state.oscillators, [oscId]: { ...oscillator, gain } } })
    }

    _changeOscEnabled = (oscId) => (enabled) => {
        this.postMessage({
            type: "OSC_CHANGE_ENABLED",
            payload: { oscId, enabled }
        })
        const oscillator = this.state.oscillators[oscId]
        this.setState({ oscillators: { ...this.state.oscillators, [oscId]: { ...oscillator, enabled } } })
    }

    _changeMasterGain(gain) {
        this.postMessage({
            type: "MASTER_CHANGE_GAIN",
            payload: gain
        })
        const master = this.state.master
        this.setState({ master: { ...master }, gain })
    }

    _changeMasterEnabled(enabled) {
        this.postMessage({
            type: "MASTER_CHANGE_ENABLED",
            payload: enabled
        })
        const master = this.state.master
        this.setState({ master: { ...master, enabled } })
    }

    _changeDelayEnabled(enabled) {
        this.postMessage({
            type: "DELAY_CHANGE_ENABLED",
            payload: enabled
        })
        const delay = this.state.effects.delay
        this.setState({ effects: { ...this.state.effects, delay: { ...delay, enabled } } })
    }

    _changeDelayAmount(amount) {
        this.postMessage({
            type: "DELAY_CHANGE_AMOUNT",
            payload: amount
        })
        const delay = this.state.effects.delay
        this.setState({ effects: { ...this.state.effects, delay: { ...delay, amount } } })
    }

    _changeDelayFeedback(feedback) {
        this.postMessage({
            type: "DELAY_CHANGE_FEEDBACK",
            payload: feedback
        })
        const delay = this.state.effects.delay
        this.setState({ effects: { ...this.state.effects, delay: { ...delay, feedback } } })
    }

    _changeDelayMix(mix) {
        this.postMessage({
            type: "DELAY_CHANGE_MIX",
            payload: mix
        })
        const delay = this.state.effects.delay
        this.setState({ effects: { ...this.state.effects, delay: { ...delay, mix } } })
    }

    _changeReverbMix(mix) {
        this.postMessage({
            type: "REVERB_CHANGE_MIX",
            payload: mix
        })
        const reverb = this.state.effects.reverb
        this.setState({ effects: { ...this.state.effects, reverb: { ...reverb, mix } } })
    }

    _changeReverbAmount(amount) {
        this.postMessage({
            type: "REVERB_CHANGE_AMOUNT",
            payload: amount
        })
        const reverb = this.state.effects.reverb
        this.setState({ effects: { ...this.state.effects, reverb: { ...reverb, amount } } })
    }

    _changeReverbEnabled(enabled) {
        this.postMessage({
            type: "REVERB_CHANGE_ENABLED",
            payload: enabled
        })
        const reverb = this.state.effects.reverb
        this.setState({ effects: { ...this.state.effects, reverb: { ...reverb, enabled } } })
    }

    _changeFilterEnabled = (filterId) => (enabled) => {
        this.postMessage({
            type: "FILTER_ENABLED",
            payload: { filterId, enabled }
        })
        const filter = this.state.filters[filterId]
        this.setState({ filters: { ...this.state.filters, [filterId]: { ...filter, enabled } } })
    }

    _changeFilterType = (filterId) => (type) => {
        this.postMessage({
            type: "FILTER_CHANGE_TYPE",
            payload: { filterId, type }
        })
        const filter = this.state.filters[filterId]
        this.setState({ filters: { ...this.state.filters, [filterId]: { ...filter, type } } })
    }

    _changeFilterCutoff = (filterId) => (cutoff) => {
        this.postMessage({
            type: "FILTER_CUTOFF",
            payload: { filterId, cutoff }
        })
        const filter = this.state.filters[filterId]
        this.setState({ filters: { ...this.state.filters, [filterId]: { ...filter, cutoff } } })
    }

    _changeFilterResonance = (filterId) => (resonance) => {
        this.postMessage({
            type: "FILTER_RESONANCE",
            payload: { filterId, resonance }
        })
        const filter = this.state.filters[filterId]
        this.setState({ filters: { ...this.state.filters, [filterId]: { ...filter, resonance } } })
    }

    postMessage(message) {
        this.props.postMessage(message)
    }
}

const Oscillators = ({ value, onChangeGain, onChangeType, onChangeEnabled }) => (
    <div>
        <div style={{ color: 'white', textAlign: 'right', paddingRight: '10px' }}>Oscillators</div>
        <Osc
            {...value.one}
            label="Oscillator 1"
            onChangeType={onChangeType("one")}
            onChangeGain={onChangeGain("one")}
            onChangeEnabled={onChangeEnabled("one")} />
        <Osc
            label="Oscillator 2"
            {...value.two}
            onChangeType={onChangeType("two")}
            onChangeGain={onChangeGain("two")}
            onChangeEnabled={onChangeEnabled("two")} />
        <Osc
            {...value.three}
            label="Oscillator 3"
            onChangeType={onChangeType("three")}
            onChangeGain={onChangeGain("three")}
            onChangeEnabled={onChangeEnabled("three")} />
    </div>
)

const Master = ({ value, onChangeGain, onChangeEnabled }) => (
    <div>
        <div style={{ color: 'white', textAlign: 'right', paddingRight: '10px' }}>Master</div>
        <div style={BOX_STYLE}>
            <input type="checkbox" checked={value.enabled} onChange={(event) => {
                const value = event.target.checked
                onChangeEnabled(value)
            }} />
            I/O
            <div style={{ paddingTop: '20px' }}>
                <LimitedKnob label="Level" start={0} end={1} default={value.gain} onChange={(value) => {
                    onChangeGain(value < 0.05 ? 0 : value)
                }} />
            </div>
        </div>
    </div>
)

const Delay = ({ value, onChangeMix, onChangeAmount, onChangeFeedback, onChangeEnabled }) => (
    <div>
        <div style={BOX_STYLE}>
            <input type="checkbox" checked={value.enabled} onChange={(event) => {
                const value = event.target.checked
                onChangeEnabled(value)
            }} />
            <span style={{ paddingLeft: '5px' }}>Delay</span>
            <div style={{ paddingTop: '20px', display: 'flex' }}>
                <LimitedKnob label="Amount" start={50} end={44100 * 3} default={value.amount} onChange={onChangeAmount} />
                <LimitedKnob label="Feedback" start={0} end={0.95} default={value.feedback} onChange={onChangeFeedback} />
                <LimitedKnob label="Mix" start={0} end={1} default={value.mix} onChange={onChangeMix} />
            </div>
        </div>
    </div>
)

const Reverb = ({ value, onChangeMix, onChangeAmount, onChangeEnabled }) => (
    <div>
        <div style={BOX_STYLE}>
            <input type="checkbox" checked={value.enabled} onChange={(event) => {
                const value = event.target.checked
                onChangeEnabled(value)
            }} />
            <span style={{ paddingLeft: '5px' }}>Reverb</span>
            <div style={{ paddingTop: '20px', display: 'flex' }}>
                <LimitedKnob label="Amount" start={0} end={7} default={value.amount} onChange={onChangeAmount} />
                <LimitedKnob label="Mix" start={0} end={1} default={value.mix} onChange={onChangeMix} />
            </div>
        </div>
    </div>
)

const Osc = ({ label, enabled, type, gain, onChangeEnabled, onChangeType, onChangeGain }) => (
    <div style={BOX_STYLE}>
        <input type="checkbox" checked={enabled} onChange={(event) => {
            const value = event.target.checked
            onChangeEnabled(value)
        }} />
        <select
            value={type}
            onChange={(event) => {
                onChangeType(event.target.value)
            }}>
            <option value="SINE">Sine</option>
            <option value="SAWTOOTH">Sawtooth</option>
            <option value="SQUARE">Square</option>
            <option value="TRIANGLE">Triangle</option>
            <option value="NOISE">Noise</option>
        </select>
        <div style={{ paddingTop: '20px' }}>
            <LimitedKnob label="Level" start={0} end={1} default={gain} onChange={onChangeGain} />
        </div>
    </div>
)

const Filters = ({ value, onChangeEnabled, onChangeType, onChangeCutoff, onChangeResonance }) => (
    <div>
        <div style={{ color: 'white', textAlign: 'right', paddingRight: '10px' }}>Filters</div>
        <Filter
            {...value.one}
            label="Filter 1"
            onChangeEnabled={onChangeEnabled("one")}
            onChangeType={onChangeType("one")}
            onChangeCutoff={onChangeCutoff("one")}
            onChangeResonance={onChangeResonance("one")} />
        <Filter
            {...value.two}
            label="Filter 2"
            onChangeEnabled={onChangeEnabled("two")}
            onChangeType={onChangeType("two")}
            onChangeCutoff={onChangeCutoff("two")}
            onChangeResonance={onChangeResonance("two")} />
        <Filter
            {...value.three}
            label="Filter 3"
            onChangeEnabled={onChangeEnabled("three")}
            onChangeType={onChangeType("three")}
            onChangeCutoff={onChangeCutoff("three")}
            onChangeResonance={onChangeResonance("three")} />
    </div>
)

const Filter = ({ label, enabled, type, cutoff, resonance, onChangeEnabled, onChangeType, onChangeCutoff, onChangeResonance }) => (
    <div style={BOX_STYLE}>
        <input type="checkbox" checked={enabled} onChange={(event) => {
            const value = event.target.checked
            onChangeEnabled(value)
        }} />
        <select value={type} onChange={(event) => {
            onChangeType(event.target.value)
        }}>
            <option value="LOWPASS">Low pass</option>
            <option value="HIGHPASS">High pass</option>
            <option value="ALLPASS">All pass</option>
        </select>
        <div style={{ paddingTop: '20px', display: 'flex' }}>
            <LogKnob label="Cutoff" start={50} end={44100 / 2} default={cutoff} onChange={onChangeCutoff} />
            <LimitedKnob label="Resonance" start={0} end={20} default={resonance} onChange={onChangeResonance} />
        </div>
    </div>
)

const START_OFFSET = 60
const END_OFFSET = 40

class LimitedKnob extends React.Component {

    min = 0
    max = 100

    state = {
        value: this.fromRealValue(this.props.default)
    }

    render() {
        return <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px'
        }}>
            <Knob
                style={{ paddingBottom: '10px' }}
                unlockDistance={0}
                preciseMode={false}
                value={this.state.value}
                min={this.min}
                max={this.max}
                onChange={this.onChange.bind(this)} />
            <span>{this.props.label}</span>
        </div>
    }

    onChange(value) {
        if (value >= START_OFFSET || value <= END_OFFSET) {
            let offsetValue = this.toOffsetValue(value)

            if (Math.abs(this.state.offsetValue - offsetValue) > 10) {
                return
            }

            if (value != this.state.value) {
                this.setState({ value: value, offsetValue: offsetValue })
                if (this.props.scaler) {
                    this.props.onChange(this.props.scaler(
                        offsetValue
                    ))
                } else {
                    this.props.onChange(this.scaleValue(offsetValue))
                }
            }
        }
    }

    toOffsetValue(value) {
        // numbers between
        // 60 - 100 == 1 - 50
        // 0 - 40 == 51 - 100
        if (value <= 60) {
            const scale = 50 / 40
            return 50 + (value * scale)
        } else {
            const scale = 50 / 40
            return (value * scale) - 75
        }
    }

    fromRealValue(realValue) {
        let scaled = 0
        if (realValue != 0) {
            scaled = (this.max / this.props.end) * realValue
        }

        if (scaled >= this.max / 2) {
            const remainder = (scaled - 50)
            return remainder * (40 / 50)
        } else {
            const remainder = scaled
            return remainder + (75 * (40 / 50))
        }
    }

    scaleValue(offsetValue) {
        return offsetValue * (this.props.end / this.max)
    }
}

class LogKnob extends React.Component {

    minpos = 0
    maxpos = 100;
    minlval = this.props.start === 0 ? 0 : Math.log(this.props.start);
    maxlval = Math.log(this.props.end);

    scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);

    render() {
        return <LimitedKnob
            {...this.props}
            scaler={this.scaleValue.bind(this)} />
    }

    scaleValue(value) {
        return Math.min(Math.exp((value - this.minpos) * this.scale + this.minlval), this.props.end)
    }
}