mapboxgl.accessToken = 'pk.eyJ1IjoiZW5kZXJtYXNvbiIsImEiOiJjbDh1c3E2Y20wN2FuM3BvZzhxYW4zNndpIn0.MWkq3OWmG-285QQQ318pfg';

//lokalizáció

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
})

function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude], false)
}

function errorLocation() {
    setupMap([17.63517, 47.68329], true)
}

function setupMap(center, error) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 14
    });

    map.on('click', (event) => {
        // If the user clicked on one of your markers, get its information.
        const features = map.queryRenderedFeatures(event.point, {
            layers: ['illemhelykeresov3']
        });
        if (!features.length) {
            return;
        }
        const feature = features[0];
        var fordis;
        if(feature.properties.Fordis) {
            fordis =  "Igen";
        }
        else {
            fordis = "Nem";
        } 

        const popup = new mapboxgl.Popup({
                offset: [0, -15]
            })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(
                `<h3>${feature.properties.Postalcode} ${feature.properties.City}, ${feature.properties.Address}</h3><p>Nyitva tartás: ${feature.properties.Open}</p>Használati díj: ${feature.properties.Price}<p>Mozgáskorlátozottaknak is? ${fordis}</p><p>${feature.properties.Comment}</p>`
            )
            .addTo(map);
    });


    map.on('load', () => {
        // Load an image from an external URL.
        map.loadImage(
            'icon.svg',
            (error_image, image) => {
                if (error_image) throw error_image;

                // Add the image to the map style.
                map.addImage('icon', image);

                map.addSource('illemv3', {
                    type: 'geojson',
                    // Use a URL for the value for the `data` property.
                    data: 'api/geojson',
                });

                map.addLayer({
                    'id': 'illemhelykeresov3',
                    'type': 'symbol',
                    'source': 'illemv3',
                    'layout': {
                        'icon-image': 'icon', // reference the image
                        'icon-size': 0.05,
                        'icon-allow-overlap':true,
                    }
                });
            }
        );
    });

    if (!error) {
        const size = 200;

        const pulsingDot = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),

            onAdd: function() {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext('2d');
            },

            render: function() {
                const duration = 1000;
                const t = (performance.now() % duration) / duration;

                const radius = (size / 2) * 0.3;
                const outerRadius = (size / 2) * 0.7 * t + radius;
                const context = this.context;

                //Külső kör
                context.clearRect(0, 0, this.width, this.height);
                context.beginPath();
                context.arc(
                    this.width / 2,
                    this.height / 2,
                    outerRadius,
                    0,
                    Math.PI * 2
                );
                context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
                context.fill();

                // Belső kör.
                context.beginPath();
                context.arc(
                    this.width / 2,
                    this.height / 2,
                    radius,
                    0,
                    Math.PI * 2
                );
                context.fillStyle = 'rgba(255, 100, 100, 1)';
                context.strokeStyle = 'white';
                context.lineWidth = 2 + 4 * (1 - t);
                context.fill();
                context.stroke();

                // Update this image's data with data from the canvas.
                this.data = context.getImageData(
                    0,
                    0,
                    this.width,
                    this.height
                ).data;

                // Continuously repaint the map, resulting
                // in the smooth animation of the dot.
                map.triggerRepaint();

                // Return true to let the map know that the image was updated.
                return true;
            }
        };

        //kattintható ikonok a helyeken
        map.on('load', () => {
            map.addImage('pulsing-dot', pulsingDot, {
                pixelRatio: 2
            });

            map.addSource('dot-point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': center // icon position [lng, lat]
                        }
                    }]
                }
            });
            map.addLayer({
                'id': 'layer-with-pulsing-dot',
                'type': 'symbol',
                'source': 'dot-point',
                'layout': {
                    'icon-image': 'pulsing-dot'
                }
            });
        });
    }

}