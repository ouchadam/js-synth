export default class Delay {

    buffer = new CircularBuffer(44100 * 3)
    current = 0

    update(delayAmount) {
        this.buffer.updateDistance(Math.ceil(delayAmount))
    }

    process(input, feedback, mix) {
        this.current = this.buffer.read()
        this.buffer.next()
        this.buffer.push(input + (this.current * feedback))
        return (input * (1 - mix)) + (this.current * mix)
    }

    reset() {
        this.buffer.reset()
    }

}

class CircularBuffer {

    readIndex = 0

    constructor(size) {
        this.buffer = new Array(size).fill(0)
        this.size = size
    }

    updateDistance(distance) {
        this.size = distance
        this.writeIndex = 0
        this.readIndex = 1
    }

    push(value) {
        this.buffer[this.writeIndex] = value
    }

    next() {
        this.writeIndex = (this.writeIndex + 1) % this.size
        this.readIndex = (this.readIndex + 1) % this.size
    }

    read() {
        return this.buffer[this.readIndex]
    }

    reset() {
        this.buffer.fill(0)
    }
}