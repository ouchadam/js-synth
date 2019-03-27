export default class BiQuadFilter {

    x = [0, 0]
    y = [0, 0]

    a = [1, 0, 0]
    b = [0, 0, 0]

    update(sampleRate, filter) {
        switch (filter.type) {
            case "LOWPASS": {
                this.lowPass(sampleRate, filter.cutoff, filter.resonance)
                break
            }

            case "HIGHPASS": {
                this.highPass(sampleRate, filter.cutoff, filter.resonance)
                break
            }

            case "ALLPASS": {
                this.allPass(sampleRate, filter.cutoff, filter.resonance)
                break
            }
        }
    }

    allPass(sampleRate, filterFreq, q) {
        const frequency = Math.max(0, Math.min(filterFreq / sampleRate, 1))
        const resonance = Math.max(0, q);

        if (frequency > 0 && frequency < 1) {
            if (q > 0) {
                const w0 = (Math.PI * 2) * frequency;
                const alpha = Math.sin(w0) / (2 * resonance);
                const k = Math.cos(w0);

                this.setNormalizedCoefficients(
                    1 - alpha,
                    -2 * k,
                    1 + alpha,
                    1 + alpha,
                    -2 * k,
                    1 - alpha
                )
            } else {
                this.setNormalizedCoefficients(-1, 0, 0, 1, 0, 0)
            }
        } else {
            this.setNormalizedCoefficients(1, 0, 0, 1, 0, 0)
        }
    }

    highPass(sampleRate, filterCutoff, filterResonance) {
        const cutoff = Math.max(0, Math.min(filterCutoff / sampleRate, 1))
        const resonance = Math.max(0, filterResonance);

        if (cutoff == 1) {
            this.setNormalizedCoefficients(0, 0, 0, 1, 0, 0)
        } else if (cutoff == 0) {
            this.setNormalizedCoefficients(1, 0, 0, 1, 0, 0)
        } else {
            const g = Math.pow(10.0, 0.05 * resonance);
            const d = Math.sqrt((4 - Math.sqrt(16 - 16 / (g * g))) / 2);

            const theta = (Math.PI * 2) * cutoff;
            const sn = 0.5 * d * Math.sin(theta);
            const beta = 0.5 * (1 - sn) / (1 + sn);
            const gamma = (0.5 + beta) * Math.cos(theta);
            const alpha = 0.25 * (0.5 + beta + gamma);

            this.setNormalizedCoefficients(
                2 * alpha,
                2 * -2 * alpha,
                2 * alpha,
                1,
                2 * -gamma,
                2 * beta
            )
        }
    }

    lowPass(sampleRate, filterCutoff, filterResonance) {
        const cutoff = Math.max(0, Math.min(filterCutoff / sampleRate, 1))
        const resonance = Math.max(0, filterResonance);

        if (cutoff == 1) {
            this.setNormalizedCoefficients(1, 0, 0, 1, 0, 0)
        } else if (cutoff == 0) {
            this.setNormalizedCoefficients(0, 0, 0, 1, 0, 0)
        } else {
            const g = Math.pow(10.0, 0.05 * resonance);
            const d = Math.sqrt((4 - Math.sqrt(16 - 16 / (g * g))) / 2);

            const theta = (Math.PI * 2) * cutoff;
            const sn = 0.5 * d * Math.sin(theta);
            const beta = 0.5 * (1 - sn) / (1 + sn);
            const gamma = (0.5 + beta) * Math.cos(theta);
            const alpha = 0.25 * (0.5 + beta - gamma);

            this.setNormalizedCoefficients(
                2 * alpha,
                2 * 2 * alpha,
                2 * alpha,
                1,
                2 * -gamma,
                2 * beta
            )
        }
    }

    setNormalizedCoefficients(b0, b1, b2, a0, a1, a2) {
        const a0Inverse = 1 / a0;
        this.b[0] = b0 * a0Inverse;
        this.b[1] = b1 * a0Inverse;
        this.b[2] = b2 * a0Inverse;
        this.a[1] = a1 * a0Inverse;
        this.a[2] = a2 * a0Inverse;
    }

    process(x) {
        const y = this.b[0] * x +
            this.b[1] * this.x[0] +
            this.b[2] * this.x[1] -
            this.a[1] * this.y[0] -
            this.a[2] * this.y[1]

        this.x[1] = this.x[0]
        this.x[0] = x
        this.y[1] = this.y[0]
        this.y[0] = y

        return y
    }

    reset() {
        this.x2 = 0;
        this.x1 = 0;
        this.y2 = 0;
        this.y1 = 0;
    }
}