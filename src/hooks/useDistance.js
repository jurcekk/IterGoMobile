const useDistance = () => {
  var rad = function (x) {
    return (x * Math.PI) / 180;
  };

  var getDistance = function (p1, p2) {
    var R = 6378137;
    var dLat = rad(p2.latitude - p1.latitude);
    var dLong = rad(p2.longitude - p1.longitude);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.latitude)) *
        Math.cos(rad(p2.latitude)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return (d / 1000).toFixed(2);
  };

  return {
    getDistance,
  };
};

export default useDistance;
