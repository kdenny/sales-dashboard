import json
import csv
from pprint import pprint

with open('usData.json','rt') as jfile:
    states = json.load(jfile)

new_json = states
feats = []

popDict = {}
with open("state_pops.csv","rt") as ifile:
        rd = csv.DictReader(ifile)
        for row in rd:
            popDict[row['abbr']] = row['pop_est_2014']


for st in states['features']:
    ft = st
    if ft['properties']['abbr'] in popDict:
        ft['properties']['population'] = popDict[ft['properties']['abbr']]
        feats.append(ft)

new_json['features'] = feats
with open("usData.js","wt") as ofile:
    tx = "/* eslint-disable */\nexport default { usMap: "
    tx += json.dumps(new_json)
    tx += "}"
    ofile.write(tx)