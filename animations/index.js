import anime from 'animejs'

export const svgAnimations = {
    flare: (element) => {
        const initialValue = "583.795 58.2335 610.966 124.102 641.43 68.1138 634.843 132.335 664.484 113.398 649.663 147.979 709.768 135.629 644.723 172.68 719.648 188.323 648.84 192.44 685.891 227.021 635.666 210.554 643.076 261.602 609.319 213.024 593.675 283.009 584.618 216.317 545.921 248.428 578.031 203.144 517.103 213.847 566.505 182.56 492.403 156.213 573.091 156.213 501.46 102.695 596.145 134.805"
        const randomFlare = () => initialValue.split(' ').map((val, i) => i === 0 ? val : String(Math.round(Math.random()) > 0 ? Number(val) + 5 : Number(val) - 5)).join(' ')
        return anime({
            targets: element,
            points: [{ value: initialValue }].concat(Array(25).fill('x').map(() => {
                return {
                    value: randomFlare()
                }
            })),
            easing: 'linear',
            duration: 5000,
            direction: 'alternate',
            loop: true
        })
    },
    bounce: (element) => {
        return anime({
            targets: element,
            translateY: [
                { value: -20, duration: 1000, easing: 'easeOutCubic' },
                { value: 0, duration: 1000, easing: 'easeInCubic' }
            ],

            loop: true,
        })
    }
}
export const notificationAnimations = {
    pop: (element) => {
        return anime({
            targets: element,
            scale: [1, 2, 1],
            easing: 'easeInOutQuad',
            duration: 1000,
            loop: false
        })
    }
}
