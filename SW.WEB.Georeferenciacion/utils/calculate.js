const cos = Math.cos, asin = Math.asin;
function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

var lat = Number(-2.207105); // latitude of centre of bounding circle in degrees
var lon = Number(-79.899641); // longitude of centre of bounding circle in degrees
var rad = Number(1); // radius of bounding circle in kilometers

var R = 6371;   // earth's mean radius, km
// first-cut bounding box (in degrees)
var maxLat = lat + radians_to_degrees(rad / R);
var minLat = lat - radians_to_degrees(rad / R);
var maxLon = lon + radians_to_degrees(asin(rad / R) / cos(degrees_to_radians(lat)));
var minLon = lon - radians_to_degrees(asin(rad / R) / cos(degrees_to_radians(lat)));


var params = {
    lat: degrees_to_radians(lat),
    lon: degrees_to_radians(lon),
    minLat: minLat,
    minLon: minLon,
    maxLat: maxLat,
    maxLon: maxLon,
    rad: rad,
    R: R
};

console.log(params);
console.log(params.toString());