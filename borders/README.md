# Historical borders

Simplified world borders for 54 moments from 123,000 BC to 2010, one file per snapshot (`<year>.json`, TopoJSON, layer `borders`). `years.json` lists the snapshots; negative years are BC as the source counts them (`-500` is 500 BC).

**Source:** [historical-basemaps](https://github.com/aourednik/historical-basemaps) by André Ourednik and contributors, commit `4b5039e50d8d2464b065bd76ad6086cd4597108d`, licensed under the GNU General Public License v3.0. The data is a work in progress and approximate; check other sources before relying on a border.

**Changes made here:** kept only the `NAME`, `SUBJECTO` and `BORDERPRECISION` fields, merged each polity's pieces into one shape, dropped islands under 300 km², simplified the shapes to 3% of their points, and converted to TopoJSON, using [mapshaper](https://github.com/mbloch/mapshaper) 0.6.102:

```sh
mapshaper -i world_<year>.geojson -filter-fields NAME,SUBJECTO,BORDERPRECISION \
  -dissolve2 NAME copy-fields=SUBJECTO,BORDERPRECISION -filter-islands min-area=300km2 remove-empty \
  -simplify 3% keep-shapes -rename-layers borders -o <year>.json format=topojson quantization=10000
```
