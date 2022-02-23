# OpenLevelUp API
OpenLevelUp can be called using various parameters. They allow to set the initial view in a given state.

## Classic
The classic URL is human-readable and easily editable. The URL is separated in two parts: query and hash, making the URL looking like this.

`http://openlevelup.net/?<QUERY PART>#<HASH PART>`

An example of full URL: `http://openlevelup.net/?t=2&l=-0.5&o=tun#13/48.1126/-1.6613`

### Query part
The query part contains global parameters, such as options, level, tile layer to use... They consist in a serie of key=value parameters, separated by a `&` character.

`param1=value1&param2=value2&param3=value3`

Description of available parameters:
* t: the tile layer to use (integer value starting from 0, corresponding to the tile layer index in `config.json`)
* l: the building level (float value, corresponding to `level` tag in OSM)
* s: the map style to use (string value corresponding to style file name)
* o: the options, one character corresponds to an activated boolean option. For example `o=nut` means show OSM notes, show objects without style, and objects going through levels. The available parameters are:
 * t: show objects going through levels (like stairs or elevators)
 * b: show only buildings
 * p: underline objects having associated pictures
 * u: show objects without a defined style
 * n: show OpenStreetMap notes

An example of query part: `t=2&l=-0.5&o=tun`

### Hash part
The hash part contains map specific parameters, such as latitude, longitude and zoom level. This part is handled by the Leaflet-Hash extension. The parameters should have the following structure:

`#<ZOOM>/<LATITUDE>/<LONGITUDE>`

The latitude and longitude are explained in degrees. The zoom value is an integer from 0 to 24 (max level defined in `config.json`).

An example of hash part: `#13/48.1126/-1.6613`


## Short
Before version 3, OpenLevelUp was able to generate short URL, as the classical one was very long. Now, the classic URL is shorter, making short URL irrelevant. OpenLevelUp doesn't generate new short URL, but can still read old ones.
