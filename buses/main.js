
(function(){

    //create map in leaflet and tie it to the div called 'theMap'
    var map = L.map('theMap').setView([44.650627, -63.597140], 14);
    var bus = L.icon({
        iconUrl:'bus.png',
        iconSize: [32,37],
        iconAnchor: [15,15],
        popupAnchor: [0,0]
    });

    //update the bus info every 10 seconds
    setInterval(getInfo,10000);

    //variables for the layers
    var busLayer = L.geoJSON();
    var mapLayer = L.tileLayer();


    function getInfo(){
    fetch("https://hrmbusapi.herokuapp.com/")
    .then(function(response){
        return response.json();
    }).then(function(json){
        //removing the old busses when the updated busses come
        map.eachLayer(function(layer){
            if(layer != mapLayer ){
                layer.remove();
            }
        });

        //the layer the map is being added to
        mapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        //getting only the busses on routes 1-10
        let filteredBusses = json.entity.filter(x=>x.vehicle.trip.routeId <= 100);

        //creating a GeoJSON of each bus and adding it to the busLayer
        filteredBusses.map(function(x){  
            let lat = x.vehicle.position.latitude;
            let long = x.vehicle.position.longitude;
            geoJSONfeature = { "type": "Point", "coordinates": [long, lat] , 
            "properties" : {"routeID": x.vehicle.trip.routeId , 
            "busID": x.id, 
            "direction": x.vehicle.position.bearing,
            "Speed": x.vehicle.position.speed}};
            const options = {
                pointToLayer: (feature, latLng) => 
                L.marker(latLng, {rotationAngle: feature.properties.direction, icon:bus})
                .bindPopup("Route ID: " + feature.properties.routeID + "<br>" + 
                        "Bus ID: " + feature.properties.busID + "<br>" + 
                        "Speed: " + parseInt(feature.properties.Speed) + " Km/h")
              }
            busLayer = L.geoJSON(geoJSONfeature, options);
            map.addLayer(busLayer);
        });
    });
}
})()