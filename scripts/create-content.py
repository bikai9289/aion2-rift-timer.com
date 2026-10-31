"""Factual lookup data reviewed against the linked public client-data pages."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
base='https://metabot.gg/en/aion-2/'
zones=[]
for name,areas in [('Altgard',['Moslan Forest','Root of the Sacred Tree Entrance','Basfelt Ruins']),('Verteron',['Destroyed Abyss Gate','Forest of Exiles','Southern Altamia Highland']),('Morheim',['Nephra Snowfield','Iralcig Highland']),('Eltnen',['Eiron Hill','Fractured Land'])]:
 for area in areas:zones.append(dict(map=name,zone=area,possibleSpots=5,source=base+'map/'+name.lower()+'/rifts'))
rows=[
 ('elyos','spacetime-rift','Spacetime Rift',97797,21000,'Altgard Traveler','Facade Ring',None),
 ('elyos','spacetime-rift-not-quite-the-same','Not Quite the Same',97797,21000,'Give and Take','Facade Bracelet','Personal'),
 ('elyos','spacetime-rift-unfamiliar-material','Unfamiliar Material',97797,21000,'Early Adopter','Facade Earrings',None),
 ('elyos','spacetime-rift-beautiful-carapace','Beautiful Carapace',411483,36000,'Stay Clear','Wind Breeze Earrings','Party'),
 ('elyos','spacetime-rift-pure-plants','Pure Plants',411483,36000,'Air Filter','Wind Breeze Ring',None),
 ('elyos','spacetime-rift-perfect-tool','Perfect Tool',961303,57000,'Secret Stash','Drifter Earrings','Legion'),
 ('elyos','spacetime-rift-trendsetter','Trendsetter',961303,57000,"Pandora's Box",'Drifter Ring',None),
 ('asmodian','spacetime-rift-asmodian','Spacetime Rift',213118,21000,'Verteron Traveler','Outsider Ring',None),
 ('asmodian','spacetime-rift-unknown-species','Unknown Species',213118,21000,'Give and Take','Outsider Earrings','Personal'),
 ('asmodian','spacetime-rift-unfamiliar-material-asmodian','Unfamiliar Material',213118,21000,'Early Adopter','Outsider Bracelet',None),
 ('asmodian','spacetime-rift-difference-between-here-and-there','Difference Between Here and There',896701,36000,'Driving the Highway to Hell','Chaser Ring',None),
 ('asmodian','spacetime-rift-developing-travel-goods','Developing Travel Goods',896701,36000,'Stay Clear','Chaser Earrings','Party'),
 ('asmodian','spacetime-rift-an-honest-shugo','An Honest Shugo',935567,58000,'Action over Words','Avenger Ring',None),
 ('asmodian','spacetime-rift-proof','Proof',935567,58000,'I Believe What I See','Avenger Earrings','Legion')]
quests=[dict(id=slug,faction=faction,name=name,level=45,exp=exp,kina=kina,wisdomStone=1,daevanionCrystal=1,abyssPoints=2000,title=title,accessory=accessory,kisk=kisk,source=base+'quests/'+slug) for faction,slug,name,exp,kina,title,accessory,kisk in rows]
bosses=[
 dict(name='Watcher Kaira',locations=['Black Fragments Area - Abandoned Island']),
 dict(name='Guardian Lord Nahma',locations=["Reshanta’s Root",'Devastated Remnants - Shade Island','Black Fragments Area - Lonely Island']),
 dict(name='Executor Tamasa',locations=["Reshanta’s Root"]),
 dict(name='Executor Argo',locations=["Archipelago of Siel’s Wings - Siel’s Heart"]),
 dict(name='Executor Kaira',locations=['Sulfur Tree Island - Branding Island'])]
data=dict(checkedAt='2026-10-31',clientBuild='0.0.4387.0',note='Client-derived community reference, not an in-game observation by this site. Counts describe candidate positions, not guaranteed simultaneous portals.',zones=zones,quests=quests,bosses=bosses,bossSource='https://wikily.gg/aion-2/bosses/spawn-times')
(root/'src/data/content.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Wrote 10 zones / 50 candidate spots, 14 quests and boss-location facts.')
