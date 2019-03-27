import BiQuadFilter from './biquad-filter.js'
import Delay from './delay.js'

export default class Reverb {

    allPassOne = new AllPass(347, 0.2)
    allPassTwo = new AllPass(113, 0.2)
    allPassThree = new AllPass(37, 0.2)

    combOne = new Comb(1687, 0.773)
    combTwo = new Comb(1601, 0.802)
    combThree = new Comb(2053, 0.753)
    combFour = new Comb(2251, 0.733)

    update(amountMultiplier) {
        this.combOne.update(1687 * amountMultiplier)
        this.combTwo.update(1601 * amountMultiplier)
        this.combThree.update(2053 * amountMultiplier)
        this.combFour.update(2251 * amountMultiplier)
    }

    process(input, reverbState) {
        let reverb = this.allPassOne.process(input * 0.1)
        reverb = this.allPassTwo.process(reverb)
        reverb = this.allPassThree.process(reverb)

        const x1 = this.combOne.process(reverb)
        const x2 = this.combTwo.process(reverb)
        const x3 = this.combThree.process(reverb)
        const x4 = this.combFour.process(reverb)

        const s1 = x1 + x3
        const s2 = x2 + x4
        return (input * (1 - reverbState.mix)) + ((s1 - s2) * reverbState.mix)
    }

}

class Comb {

    filter = new BiQuadFilter()
    delay = new Delay()

    constructor(delayAmount, feedback) {
        this.delay.update(delayAmount)
        this.filter.update(44100, {
            type: "LOWPASS",
            cutoff: 3000,
            resonance: 1
        })
        this.feedback = feedback
    }

    update(delayAmount) {
        this.delay.update(delayAmount)
    }

    process(input) {
        return this.filter.process(this.delay.process(input, this.feedback, 1))
    }
}

class AllPass {
    filter = new BiQuadFilter()
    delay = new Delay()

    constructor(delayAmount, feedback) {
        this.delay.update(delayAmount)
        this.filter.update(44100, {
            type: "ALLPASS",
            cutoff: 100,
            resonance: 1
        })
        this.feedback = feedback
    }

    update(delayAmount) {
        this.delay.update(delayAmount)
    }

    process(input) {
        return this.filter.process(this.delay.process(input, this.feedback, 1))
    }
}