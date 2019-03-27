import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import AudioKeys from 'audiokeys';
import AudioVisualiser from './audio-visualiser'
import FFT from './fft'
import SynthUI from './synth-ui';


document.body.style.margin = 0
document.body.style.padding = 0
document.body.style.backgroundColor = 'hsl(0, 0%, 15%)'

class AudioApp extends React.Component {

  state = {
    hasInteracted: false
  }

  render() {
    return <App />
    // if (this.state.hasInteracted) {
    //   return <App />
    // } else {
    //   return <button onClick={() => this.setState({ hasInteracted: true })}>Start</button>
    // }
  }

}

class Analysis extends React.Component {

  analyser = this.props.analyser

  state = {
    amplitudeData: new Uint8Array(0),
    frequencyData: new Uint8Array(0)
  }

  render() {
    return (
      <div>
        <AudioVisualiser audioData={this.state.amplitudeData} />
        <FFT audioData={this.state.frequencyData} />
      </div>
    )
  }

  tick() {
    if (!this.analyser) {
      return
    }
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.setState({ amplitudeData: this.dataArray, frequencyData: this.frequencyData });
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  componentDidMount() {
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.frequencyData = new Uint8Array(this.analyser.fftSize);

    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId)
  }
}

class App extends React.Component {

  keyboard = new AudioKeys()

  state = {
    connected: false
  }

  render() {
    if (this.state.connected) {
      return (
        <div style={{ height: '100vh' }}>
          <Analysis analyser={this.analyser} />
          <SynthUI postMessage={this.postMessage.bind(this)} />
        </div>
      )
    } else {
      return (
        <div>Loading...</div>
      )
    }
  }

  componentDidMount() {
    this.keyboard.down((note) => {
      this.postMessage({
        type: "NOTE_ON",
        payload: note.frequency
      })
    })

    this.keyboard.up((note) => {
      this.postMessage({
        type: "NOTE_OFF"
      })
    })

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser()

    this.audioContext.audioWorklet.addModule('workers/main-processor.js').then(() => {
      this.processor = new AudioWorkletNode(this.audioContext, 'main-processor');
      this.processor.connect(this.analyser).connect(this.audioContext.destination);
      this.setState({ connected: true })
    })
  }

  postMessage(message) {
    if (this.processor) {
      this.processor.port.postMessage(message)
    }
  }

  componentWillUnmount() {
    this.audioContext.close()
  }
}

ReactDOM.render(
  <AudioApp />,
  document.getElementById('app')
);
serviceWorker.register();

module.hot.accept();