export default class Envelope {

    lastKnownMultiplier = 0
    lastReleaseMultiplier = 0
    gainIndex = 0
    gainStage = "IDLE"

    noteStart() {
        this.gainIndex = 0
        this.gainStage = "WAIT_FOR_SYNC"
    }

    noteEnd() {
        this.gainIndex = 0
        this.gainStage = "RELEASE"
    }

    process(input, envelope) {
        let multiplier = 0
        switch (this.gainStage) {
            case "IDLE": {
                multiplier = 0
                this.lastKnownMultiplier = 0
                this.lastReleaseMultiplier = 0
                break
            }
            case "WAIT_FOR_SYNC": {
                let bar = Math.min((this.gainIndex / 100), 1)
                multiplier = (1 - bar) * this.lastReleaseMultiplier

                if (multiplier === 0) {
                    this.gainStage = "ATTACK"
                    this.lastReleaseMultiplier = 0
                    this.gainIndex = -1
                }
                break
            }
            case "ATTACK": {
                let bar = Math.min((this.gainIndex / envelope.attack.amount), 1)
                multiplier = (bar * envelope.attack.level)
                this.lastKnownMultiplier = multiplier
                break
            }
            case "SUSTAIN": {
                multiplier = envelope.sustain.level
                this.lastKnownMultiplier = multiplier
                break
            }
            case "RELEASE": {
                let bar = Math.min((this.gainIndex / envelope.release.amount), 1)
                multiplier = (1 - bar) * this.lastKnownMultiplier
                this.lastReleaseMultiplier = multiplier
                break
            }
        }
        this.gainIndex++
        return input * multiplier
    }

}