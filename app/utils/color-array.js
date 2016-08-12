export default (percentage, hue0, hue1) => {
    var hue = (percentage/100 * (hue1 - hue0)) + hue0;
    return 'hsla(' + hue + ', 100%, 50%, 1)';
}