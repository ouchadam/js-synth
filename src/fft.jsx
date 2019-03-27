import React from 'react';

export default class FFT extends React.Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
    }

    componentDidUpdate() {
        this.draw();
    }

    draw() {
        const data = this.props.audioData;
        const canvas = this.canvas.current;
        const height = canvas.height;
        const width = canvas.width;
        const context = canvas.getContext('2d');

        context.fillStyle = 'hsl(0, 0%, 15%)';
        context.fillRect(0, 0, width, height);
        context.strokeStyle = 'white'
        context.strokeRect(0, 0, width, height);


        const barWidth = (width / data.length) * 2.5;
        let barHeight;
        let x = 0;

        const scale = height / 255

        for (var i = 0; i < data.length; i++) {
            barHeight = data[i] * scale;

            context.fillStyle = "white";
            context.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    render() {
        return <canvas width="600" height="300" ref={this.canvas} />;
    }
}