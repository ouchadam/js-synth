import React from 'react';

const MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

export default class AudioVisualiser extends React.Component {
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

    var quarterHeight = height / 4;
    var scaling = height / 256;

    context.strokeStyle = "white";
    context.lineWidth = 1;
    context.fillStyle = 'hsl(0, 0%, 15%)';
    context.fillRect(0, 0, width, height);
    context.strokeRect(0, 0, width, height);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(width, 0);
    context.stroke();
    context.moveTo(0, height);
    context.lineTo(width, height);
    context.stroke();
    context.save();
    context.strokeStyle = "#006644";
    context.beginPath();
    if (context.setLineDash)
      context.setLineDash([5]);
    context.moveTo(0, quarterHeight);
    context.lineTo(width, quarterHeight);
    context.stroke();
    context.moveTo(0, quarterHeight * 3);
    context.lineTo(width, quarterHeight * 3);
    context.stroke();

    context.restore();
    context.beginPath();
    context.strokeStyle = "white";
    context.moveTo(0, quarterHeight * 2);
    context.lineTo(width, quarterHeight * 2);
    context.stroke();

    context.strokeStyle = "white";

    context.beginPath();

    var zeroCross = this.findFirstPositiveZeroCrossing(data, width);

    context.moveTo(0, (256 - data[zeroCross]) * scaling);
    for (var i = zeroCross, j = 0; (j < width) && (i < data.length); i++ , j++)
      context.lineTo(j, (256 - data[i]) * scaling);

    context.stroke();
  }

  render() {
    return <canvas width="300" height="300" ref={this.canvas} />;
  }


  findFirstPositiveZeroCrossing(buf, buflen) {
    var i = 0;
    var last_zero = -1;
    var t;

    // advance until we're zero or negative
    while (i < buflen && (buf[i] > 128))
      i++;

    if (i >= buflen)
      return 0;

    // advance until we're above MINVAL, keeping track of last zero.
    while (i < buflen && ((t = buf[i]) < MINVAL)) {
      if (t >= 128) {
        if (last_zero == -1)
          last_zero = i;
      } else
        last_zero = -1;
      i++;
    }

    // we may have jumped over MINVAL in one sample.
    if (last_zero == -1)
      last_zero = i;

    if (i == buflen)  // We didn't find any positive zero crossings
      return 0;

    // The first sample might be a zero.  If so, return it.
    if (last_zero == 0)
      return 0;

    return last_zero;
  }
}