class SkyRiverObject {
    constructor(name, wiki_link, comments) {
        this.name = name;
        this.wiki_link = wiki_link;
        this.comments = comments;
    }
    toString() {
        return this.wiki_link;
    }
}

class Region extends SkyRiverObject {
    constructor(name, wiki_link, comments) {
        super(name, wiki_link, comments);
        this.sectors = [];
        this.systems = [];
    }
}

class Sector extends SkyRiverObject {
    constructor(name, wiki_link, comments, region) {
        super(name, wiki_link, comments);
        this.region = region;
        this.systems = [];
    }
}

class System extends SkyRiverObject {
    constructor(name, wiki_link, comments, x_coord, y_coord, grid, sector, region, priority) {
        super(name, wiki_link, comments);
        this.coords = [Number(x_coord), Number(y_coord)];
        this.grid = grid;
        this.sector = sector;
        this.region = region;
        this.priority = Number(priority);
        this.stars = [];
        this.orbits = [];
        this.hyperlanes = {};
    }

    sort_orbits() {
        this.orbits.sort((a,b) => a.orbit - b.orbit);
    }
}

class Star extends SkyRiverObject {
    constructor(name, wiki_link, comments, system, classification, diameter) {
        super(name, wiki_link, comments);
        this.system = system;
        this.classification = classification;
        this.diameter = Number(diameter);
    }
}

class Body extends SkyRiverObject {
    constructor(name, wiki_link, comments, system, orbit, day, year, diameter, atmosphere, climate, gravity, terrain) {
        super(name, wiki_link, comments);
        this.system = system;
        this.orbit = Number(orbit);
        this.day_length = Number(day);
        this.year_length = Number(year);
        this.diameter = Number(diameter);
        this.atmosphere = atmosphere;
        this.climate = climate;
        this.gravity = gravity;
        this.terrain = terrain;
    }
}

class Planet extends Body {
    constructor(name, wiki_link, comments, system, orbit, day, year, classification, diameter, atmosphere, climate, gravity, terrain) {
        super(name, wiki_link, comments, system, orbit, day, year, diameter, atmosphere, climate, gravity, terrain);
        this.classification = classification;
        this.orbits = [];
    }

    sort_orbits() {
        this.orbits.sort((a,b) => b.orbit - a.orbit);
    }
}

class Moon extends Body {
    constructor(name, wiki_link, comments, planet, system, orbit, day, year, diameter, atmosphere, climate, gravity, terrain) {
        super(name, wiki_link, comments, system, orbit, day, year, diameter, atmosphere, climate, gravity, terrain);
        this.planet = planet;
    }
}

class Asteroid extends SkyRiverObject {
    constructor(name, wiki_link, comments, body, system, orbit) {
        super(name, wiki_link, comments);
        this.body = body;
        this.system = system;
        this.orbit = Number(orbit);
    }
}

class SpaceStation extends SkyRiverObject {
    constructor(name, wiki_link, comments, body, system) {
        super(name, wiki_link, comments);
        this.body = body;
        this.system = system;
        this.orbit = 0;
    }
}

class Hyperlane extends SkyRiverObject {
    constructor(name, wiki_link, comments, loop, priority) {
        super(name, wiki_link, comments);
        this.loop = Boolean(loop);
        this.priority = Number(priority);
        this.systems = []
    }
}

export class Galaxy {
    constructor() {
        this.regions = [];
        this.sectors = [];
        this.systems = [];
        this.stars = [];
        this.planets = [];
        this.moons = [];
        this.asteroids = [];
        this.spacestations = [];
        this.hyperlanes = [];
    }

    async setup() {
        var data = [];
        await fetch('data/regions.csv').then(res => res.text()).then(res => data[0] = res);
        await fetch('data/sectors.csv').then(res => res.text()).then(res => data[1] = res);
        await fetch('data/systems.csv').then(res => res.text()).then(res => data[2] = res);
        await fetch('data/stars.csv').then(res => res.text()).then(res => data[3] = res);
        await fetch('data/planets.csv').then(res => res.text()).then(res => data[4] = res);
        await fetch('data/moons.csv').then(res => res.text()).then(res => data[5] = res);
        await fetch('data/asteroids.csv').then(res => res.text()).then(res => data[6] = res);
        await fetch('data/spacestations.csv').then(res => res.text()).then(res => data[7] = res);
        await fetch('data/hyperlanes.csv').then(res => res.text()).then(res => data[8] = res);

        this.init_regions(data[0]);
        this.init_sectors(data[1]);
        this.init_systems(data[2]);
        this.init_stars(data[3]);
        this.init_planets(data[4]);
        this.init_moons(data[5]);
        this.init_asteroids(data[6]);
        this.init_spacestations(data[7]);
        this.init_hyperlanes(data[8]);
        this.sort_orbits();
        console.log("Done!");
    }

    get_region(region_wiki_link) {
        for (let i=0; i < this.regions.length; i++) {
            if (this.regions[i].wiki_link === region_wiki_link) {
                return this.regions[i];
            }
        }
        return false;
    }

    get_sector(sector_wiki_link) {
        for (let i=0; i < this.sectors.length; i++) {
            if (this.sectors[i].wiki_link === sector_wiki_link) {
                return this.sectors[i];
            }
        }
        return false;
    }

    get_system(system_wiki_link) {
        for (let i=0; i < this.systems.length; i++) {
            if (this.systems[i].wiki_link === system_wiki_link) {
                return this.systems[i];
            }
        }
        return false;
    }

    get_planet(planet_wiki_link) {
        for (let i=0; i < this.planets.length; i++) {
            if (this.planets[i].wiki_link === planet_wiki_link) {
                return this.planets[i];
            }
        }
        return false;
    }

    get_hyperlane(hyperlane_wiki_link) {
        for (let i=0; i < this.hyperlanes.length; i++) {
            if (this.hyperlanes[i].wiki_link === hyperlane_wiki_link) {
                return this.hyperlanes[i];
            }
        }
        return false;
    }

    init_regions(text) {
        console.log("Initializing regions...");
        var lines = text.split('\n');
        for (let i=0; i < lines.length; i++) {
            var data = lines[i].split('|');
            var new_region = new Region(data[0], data[1], '');
            this.regions.push(new_region);
        }
    }

    init_sectors(text) {
        console.log("Initializing sectors...");
        var lines = text.split('\n');
            for (let i=0; i < lines.length; i++) {
                var data = lines[i].split('|');
            var new_sector = new Sector(data[0], data[1], '', this.get_region(data[2]));
            this.sectors.push(new_sector);
            if (new_sector.region) {
                new_sector.region.sectors.push(new_sector);
            }
        }
        }

    init_systems(text) {
        console.log("Initializing systems...");
        var lines = text.split('\n');
        for (let i=0; i < lines.length; i++) {
            var data = lines[i].split('|');
            var new_system = new System(data[0], data[1], data[2], data[3], data[4], data[5], this.get_sector(data[6]), null,data[8]);
            this.systems.push(new_system);
            if (new_system.sector) {
                new_system.region = new_system.sector.region;
                new_system.sector.systems.push(new_system);
            } else {
                new_system.region = this.get_region(data[7]);
                new_system.region.systems.push(new_system);
            }
        }
    }
    
    init_stars(text) {
        console.log("Initializing stars...");
        var lines = text.split('\n');
        for (let i=0; i < lines.length; i++) {
            var data = lines[i].split('|');
            var new_star = new Star(data[0], data[1], '', this.get_system(data[2]), data[3], data[4]);
            this.stars.push(new_star);
            new_star.system.stars.push(new_star);
        }
    }

    init_planets(text) {
        console.log("Initializing planets...");
        var lines = text.split('\n');
        for (let i=0; i < lines.length; i++) {
            var data = lines[i].split('|');
            var new_planet = new Planet(data[0], data[1], data[2], this.get_system(data[3]), data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12]);
            this.planets.push(new_planet);
            new_planet.system.orbits.push(new_planet);
        }
    }

    init_moons(text) {
        console.log("Initializing moons...");
        var lines = text.split('\n');
        for (let i=0; i < lines.length; i++) {
            var data = lines[i].split('|');
            var new_moon = new Moon(data[0], data[1], data[2], this.get_planet(data[3]), this.get_system(data[4]), data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12]);
            this.moons.push(new_moon);
            if (new_moon.planet) {
                new_moon.planet.orbits.push(new_moon);
            } else {
                new_moon.system.orbits.push(new_moon);
            }
        }
    }

    init_asteroids(text) {
        console.log("Initializing asteroids...");
        var lines = text.split('\n');
        for (let i=0; i < lines.length; i++) {
            var data = lines[i].split('|');
            var new_asteroid = new Asteroid(data[0], data[1], data[2], this.get_planet(data[3]), this.get_system(data[4]), data[5]);
            this.asteroids.push(new_asteroid);
            if (new_asteroid.body) {
                new_asteroid.body.orbits.push(new_asteroid);
            } else {
            new_asteroid.system.orbits.push(new_asteroid);
            }
        }
    }

    init_spacestations(text) {
        console.log("Initializing space stations...");
        var lines = text.split('\n');
        for (let i=0; i < lines.length; i++) {
            var data = lines[i].split('|');
            var new_spacestation = new SpaceStation(data[0], data[1], data[2], this.get_planet(data[3]), this.get_system(data[4]));
            this.spacestations.push(new_spacestation);
            if (new_spacestation.body) {
                new_spacestation.body.orbits.push(new_spacestation);
            } else {
                new_spacestation.system.orbits.push(new_spacestation);
            }
        }
    }

    init_hyperlanes(text) {
        console.log("Initializing hyperlanes...");
        var lines = text.split('\n');
        for (let i=0; i < lines.length; i++) {
            var data = lines[i].split(',');
            var new_hyperlane = new Hyperlane(data[0], data[1], '', Number(data[2]), data[3]);
            for (let j=5; j < data.length; j++) {
                var system = this.get_system(data[j]);
                if (system) {
                    new_hyperlane.systems.push(system);
                } else {
                    break;
                }
            }
            this.hyperlanes.push(new_hyperlane);

            for (let j=0; j < new_hyperlane.systems.length - 1; j++) {
                var current_system = new_hyperlane.systems[j];
                var next_system = new_hyperlane.systems[j+1];
                current_system.hyperlanes[next_system] = new_hyperlane;
                next_system.hyperlanes[current_system] = new_hyperlane;
            }

            if (new_hyperlane.loop) {
                var current_system = new_hyperlane.systems[0];
                var next_system = new_hyperlane.systems[new_hyperlane.systems.length - 1];
                current_system.hyperlanes[next_system] = new_hyperlane;
                next_system.hyperlanes[current_system] = new_hyperlane;
            }
        }
    }

    sort_orbits() {
        for (let i=0; i<this.systems.length; i++) {
            this.systems[i].sort_orbits();
        }
        for (let i=0; i<this.planets.length; i++) {
            this.planets[i].sort_orbits();
        }
    }
}