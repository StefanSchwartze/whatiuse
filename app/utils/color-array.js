export default (percentage, hue0, hue1, lightness = '50', opacity = '1') => {
    var hue = (percentage/100 * (hue1 - hue0)) + hue0;
    return 'hsla(' + hue + ', 100%, ' + lightness + '%, ' + opacity + ')';
}