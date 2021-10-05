import { Galaxy } from "./skyriver.js";

class MapCreator {

    constructor(){
        this._map = null;
        this.background_tiles = null;
        this.grid_layer = null;
        this.system_layer = null;
        this.hyperlane_layer = null;
        this.wiki_url = 'http://143.244.166.24/wiki/'
    }

    setup() {
        const COEF_A = 0.00418704833225;
        const COEF_B = 101.422871752;
        const COEF_C = -0.00418668312714;
        const COEF_D = 71.2280400419;

        // So I don't pull my hair out forgetting to flip coordinates
        var yx = L.latLng;
        var xy = function(x, y) {
            if (L.Util.isArray(x)) {    // When doing xy([x, y]);
                return yx(x[1], x[0]);
            }
            return yx(y, x);  // When doing xy(x, y);
        };

        // Custom Cartesian coordinates to fit the background image
        L.CRS.MySimple = L.extend({}, L.CRS.Simple, {
            transformation: new L.Transformation(COEF_A, COEF_B, COEF_C, COEF_D)
        });

        // Tile background
        this.background_tiles = L.tileLayer('http://143.244.166.24/skyriver/tiles/{z}/{x}/{y}.png', {
            continuousWorld: true,
            maxNativeZoom: 5
        });
        this.background_tiles.setZIndex(0);

        // Coordinate grid
        var rect_options = {color: 'White', fillOpacity: 0, weight: 1, interactive: false};
        var grid = []
        for (let i = -16500; i < 18000; i += 1500) {
            for (let j = -18000; j < 13500; j += 1500) {
                var rect = L.rectangle([xy(i,j), xy(i + 1500, j + 1500)], rect_options);
                grid.push(rect);
            }
        }
        this.grid_layer = L.layerGroup(grid);
        this.grid_layer.setZIndex(200);
        
        // Systems
        this.system_layer = L.layerGroup();
        this.system_layer.setZIndex(20000);

        // Hyperlanes
        this.hyperlane_layer = L.layerGroup();
        this.hyperlane_layer.setZIndex(10000);

        // The map
        this._map = L.map('mapid', {
            crs: L.CRS.MySimple,
            minZoom: 0,
            maxZoom: 8,
            layers: [this.background_tiles, this.grid_layer, this.hyperlane_layer, this.system_layer]
        }).setView([0,0], 2);

        var layers = {
            "Background": this.background_tiles,
            "Grid": this.grid_layer,
            "Hyperlanes": this.hyperlane_layer,
            "Systems": this.system_layer,
        };

        L.control.layers(null, layers).addTo(this._map);
    }

    add_system_markers(galaxy) {
        var markerOptions = {
            radius: 4,
            fillColor: "#00ff00",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        };

        for (let i=0; i<galaxy.systems.length; i++) {
            var system = galaxy.systems[i];
            if (!isNaN(system.coords[0])) {
                var new_marker = L.circleMarker([system.coords[1], system.coords[0]], markerOptions);
                var popup_string = '<a href=\"' + this.wiki_url + system.wiki_link + '\"><h2>' + system.name + '</h2></a>'
                popup_string += '[ ' + system.coords[0] + ' , ' + system.coords[1] + ' ]';
                popup_string += '<br/>Grid: ' + system.grid;
                popup_string += '<br/>Sector: ';

                if (system.sector) {
                    popup_string += '<a href=\"' + this.wiki_url + system.sector.wiki_link + '\">' + system.sector.name + '</a>';
                } else {
                    popup_string += 'none';
                }

                popup_string += '<br/>Region: ' + '<a href=\"' + this.wiki_url + system.region.wiki_link + '\">' + system.region.name + '</a>';
                
                if (system.stars.length) {
                    popup_string += '<br/>Stars: '
                    for (let j=0; j<system.stars.length; j++) {
                        popup_string += '<br/><a href=\"' + this.wiki_url + system.stars[j].wiki_link + '\">' + system.stars[j].name + '</a> ';
                    }
                }
                
                if (system.orbits.length) {
                    popup_string += '<br/>Obits:'
                    for (let j=0; j<system.orbits.length; j++) {
                        popup_string += '<br/>'
                        if (isNaN(system.orbits[j].orbit)) {
                            popup_string += '&bull '
                        } else {
                            popup_string += system.orbits[j].orbit + ': '
                        }
                        popup_string += '<a href=\"' + this.wiki_url + system.orbits[j].wiki_link + '\">' + system.orbits[j].name + '</a>';
                    }
                }

                new_marker.bindPopup(popup_string);
                new_marker.bindTooltip(system.name);
                this.system_layer.addLayer(new_marker);
            }            
        }
    }

    add_hyperlane_markers(galaxy) {
        var polyline_options = {
            color: "#00ffff",
            weight: 3,
        };

        for (let i=0; i<galaxy.hyperlanes.length; i++) {
            var coords = [];
            var hyperlane = galaxy.hyperlanes[i]
            for (let j=0; j < hyperlane.systems.length; j++) {
                if (!isNaN(hyperlane.systems[j].coords[0])) {
                    coords.push([hyperlane.systems[j].coords[1], hyperlane.systems[j].coords[0]]);
                }
            var new_marker = L.polyline(coords, polyline_options);
            var popup_string = '<a href=\"' + this.wiki_url + hyperlane.wiki_link + '\"><h2>' + hyperlane.name + '</h2></a>';
            new_marker.bindPopup(popup_string);
            this.hyperlane_layer.addLayer(new_marker);
            }
        }
    }
}

async function main() {
    var mapCreator = new MapCreator();
    mapCreator.setup();

    var sr = new Galaxy();
    await sr.setup();
    mapCreator.add_hyperlane_markers(sr);
    mapCreator.add_system_markers(sr);
}

main();