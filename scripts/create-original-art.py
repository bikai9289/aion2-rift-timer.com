"""Original code-native vector scenery. No downloaded images, game models, logos or fonts."""
from pathlib import Path
import random,json

root=Path(__file__).resolve().parent.parent
assets=root/'public/assets'
assets.mkdir(exist_ok=True)
scenes=[
 ('rift-gate.svg','The Meridian Gate','#7b68b8','#62d9ed','#d8bb86',0),
 ('abyss-vault.svg','The Silent Vault','#345d78','#69c9db','#ccd8df',1),
 ('ember-citadel.svg','The Ember Citadel','#7e322a','#f8b16a','#e5c18a',2),
 ('star-sanctum.svg','The Star Sanctum','#476276','#b5d5d0','#ddc8a1',3),
 ('dawn-frontier.svg','The Dawn Frontier','#3b7086','#b9e0ee','#f3d8a9',4)]
manifest=[]
for filename,title,purple,light,gold,seed in scenes:
 rng=random.Random(7621+seed)
 stars=''.join(f'<circle cx="{rng.randrange(20,1900)}" cy="{rng.randrange(20,650)}" r="{rng.choice([.6,.9,1.4,2])}" fill="{light}" opacity="{rng.uniform(.15,.75):.2f}"/>' for _ in range(150))
 ridges=[]
 for layer in range(4):
  points=[(-100,1180)]+[(x,720+layer*80-rng.randrange(30,250)) for x in range(-100,2100,180)]+[(2100,1180)]
  ridges.append(f'<polygon points="{" ".join(f"{x},{y}" for x,y in points)}" fill="{["#253342","#1b2833","#11212b","#0b1720"][layer]}" opacity="{.55+layer*.12}"/>')
 pillars=''
 for i in range(7):
  x=820+i*165;y=550+abs(i-3)*35
  pillars+=f'<path d="M{x-45} 920V{y+20}l45-95 45 95v{900-y}z" fill="url(#stone)" stroke="{gold}" stroke-opacity=".16"/><path d="M{x} {y-75}V930" stroke="{light}" stroke-opacity=".13"/>'
 rays=''.join(f'<path d="M1340 480L{x} 1080" stroke="{light}" stroke-opacity=".08"/>' for x in range(400,2400,100))
 orbit=''.join(f'<ellipse cx="1340" cy="450" rx="{size}" ry="{size*1.25}" fill="none" stroke="{gold}" stroke-opacity="{opacity}" stroke-width="{width}"/>' for size,opacity,width in [(170,.8,2),(182,.25,1),(210,.24,1),(235,.1,1)])
 spire=f'<path d="M1340 145l105 305-105 305-105-305z" fill="url(#crystal)" stroke="{light}" stroke-opacity=".8"/><path d="M1340 145v610l105-305z" fill="{purple}" opacity=".65"/><path d="m1340 145-36 305 36 305 23-305z" fill="{light}" opacity=".45"/><path d="M1235 450h210" stroke="{light}" stroke-opacity=".45"/>'
 if seed==2:spire=f'<path d="m1340 170 95 180 180-100-140 235 75 145-210-110-210 110 75-145-140-235 180 100z" fill="url(#crystal)" stroke="{gold}" stroke-opacity=".5"/><path d="m1340 240 40 190-40 105-40-105z" fill="{light}" opacity=".75"/>'
 if seed==4:spire=f'<path d="M1340 200c-170 90-240 190-300 350 125-40 215-100 300-190 85 90 175 150 300 190-60-160-130-260-300-350z" fill="url(#crystal)" stroke="{light}" stroke-opacity=".55"/><path d="M1340 230v420" stroke="{gold}" stroke-width="2"/>'
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" role="img" aria-labelledby="title"><title id="title">{title} — original abstract vector scene</title><defs>
 <linearGradient id="sky" x2=".8" y2="1"><stop stop-color="#080e18"/><stop offset=".48" stop-color="{purple}"/><stop offset="1" stop-color="#111b23"/></linearGradient>
 <radialGradient id="halo"><stop stop-color="{light}" stop-opacity=".6"/><stop offset=".3" stop-color="{purple}" stop-opacity=".36"/><stop offset="1" stop-color="{purple}" stop-opacity="0"/></radialGradient>
 <linearGradient id="stone" x2="1" y2="1"><stop stop-color="#384754"/><stop offset=".5" stop-color="#16222e"/><stop offset="1" stop-color="#080e15"/></linearGradient>
 <linearGradient id="crystal" x2=".9" y2="1"><stop stop-color="{light}"/><stop offset=".4" stop-color="{purple}"/><stop offset=".7" stop-color="#182f49"/><stop offset="1" stop-color="{gold}"/></linearGradient>
 <linearGradient id="mist" x2="0" y2="1"><stop stop-color="{light}" stop-opacity="0"/><stop offset=".5" stop-color="{light}" stop-opacity=".11"/><stop offset="1" stop-color="{light}" stop-opacity="0"/></linearGradient>
 </defs><path fill="url(#sky)" d="M0 0h1920v1080H0z"/>{stars}<ellipse cx="1340" cy="430" rx="720" ry="650" fill="url(#halo)"/>
 <circle cx="1450" cy="240" r="130" fill="none" stroke="{gold}" stroke-opacity=".12"/><circle cx="1450" cy="240" r="115" fill="none" stroke="{light}" stroke-opacity=".13"/>
 {''.join(ridges[:2])}{pillars}{rays}{orbit}{spire}<ellipse cx="1340" cy="830" rx="430" ry="55" fill="#06101b" opacity=".8"/><ellipse cx="1340" cy="826" rx="350" ry="31" fill="none" stroke="{gold}" stroke-opacity=".45"/><ellipse cx="1340" cy="823" rx="280" ry="19" fill="none" stroke="{light}" stroke-opacity=".3"/>
 <path d="M0 900 950 820 1340 850 1920 760v320H0z" fill="#0b1620"/><path d="m970 1080 370-230 370 230" fill="#1d2b35" opacity=".7"/><path d="m1120 1080 220-230 220 230" fill="#293642" opacity=".4"/>
 {''.join(ridges[2:])}<path d="M0 590h1920v300H0z" fill="url(#mist)"/><path d="m0 1080 260-200 190 35 160 165zM1920 1080l-130-240-180 100-160 140z" fill="#07111b"/>
 </svg>'''
 (assets/filename).write_text(svg,encoding='utf8')
 manifest.append(dict(file='assets/'+filename,title=title,kind='original code-authored SVG',creator='Aion 2 Rift Timer project contributors',license='CC BY-SA 4.0',source='scripts/create-original-art.py',usesThirdPartyGameArt=False))
(root/'public/art-sources.json').write_text(json.dumps(dict(version=2,updatedAt='2026-11-01',artworkCleared=True,basis='All publicly deployed scene artwork is original code-authored vector artwork. No NC artwork is included.',assets=manifest+[dict(file='assets/social-card.jpg',kind='Original geometric sharing card',source='scripts/create-icons.py',license='CC BY-SA 4.0',usesThirdPartyGameArt=False)]),indent=2)+'\n',encoding='utf8')
print('Created five original vector scenes and the public artwork provenance manifest.')
