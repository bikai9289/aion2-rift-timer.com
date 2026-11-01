"""Replace runtime references with project-authored vector assets. Historical designs are untouched."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
mapping={'wallpaperBg13.webp':'rift-gate.svg','wallpaperBg15.webp':'abyss-vault.svg','wallpaperBg4.webp':'ember-citadel.svg','wallpaperBg1.webp':'star-sanctum.svg','wallpaperBg7.webp':'dawn-frontier.svg'}
files=list((root/'src/pages').rglob('*.html'))+[root/p for p in ['src/scripts/cinematic.js','scripts/site-views.mjs','scripts/build.mjs']]
for p in files:
    text=p.read_text(encoding='utf8')
    for old,new in mapping.items():text=text.replace(old,new)
    replacements={
        'Aion 2 promotional art, not an actual portal or reset screenshot':'Original abstract portal artwork, not an in-game screenshot',
        'A luminous crystal amid a dramatic Aion 2 battle scene':'Original vector scene of a luminous crystalline portal',
        'Adventurers inside a monumental frozen cavern in Aion 2':'Original vector scene of a silent blue portal vault',
        'A fiery winged creature in an Aion 2 dungeon':'Original vector scene of an ember citadel',
        'Aion 2 adventurers gathered inside a vast, frozen cavern':'Original vector portal vault',
        'An immense fiery winged creature in an Aion 2 dungeon':'Original abstract ember citadel',
        'A monumental hall illuminated by a shaft of light in Aion 2':'Original vector star sanctum',
        'A winged Aion 2 character flying through a bright sky':'Original geometric wing sculpture above the frontier',
        'Aion 2 promotional cavern scene':'Original abstract portal vault',
        'Illustrative Aion 2 cavern artwork':'Original abstract portal vault',
        'Official Aion 2 artwork · illustrative scenes, not portal-location evidence.':'Original site artwork · illustrative scenes, not portal-location evidence.',
        'Official Aion 2 artwork · illustrative scenes. Art © NC Corporation.':'Original vector artwork · illustrative scenes, not an in-game map.',
        'Aion 2 artwork © NC Corporation. All rights reserved.':'Original site artwork · CC BY-SA 4.0.',
        'OFFICIAL AION 2 ART · © NC CORPORATION':'ORIGINAL SITE ART · CC BY-SA 4.0',
        'Art © NC Corporation · Official source ↗':'Original site artwork · credits ↗',
        'Illustration · © NC Corporation':'Original site artwork · CC BY-SA 4.0',
        'Illustration · not a portal map · Art © NC Corporation':'Original illustration · not a portal map · CC BY-SA 4.0',
    }
    for old,new in replacements.items():text=text.replace(old,new)
    text=text.replace('href="https://aion2.ncsoft.jp/en/contents" target="_blank" rel="noopener">Original site artwork · credits','href="/credits/">Original site artwork · credits')
    p.write_text(text,encoding='utf8')
config=root/'src/data/schedules.json'
data=json.loads(config.read_text(encoding='utf8'))
data['publication']['artworkCleared']=True
for region in data['regions'].values():
    for eventId in ['kaira','artifact','siege-bosses','nahma']:
        rule=region['events'][eventId]
        rule['checkedAt']='2026-11-01T00:00:00Z'
        rule['note']=('Shugo reports Korea and Taiwan every 4 hours (6 daily starts), versus Global every 3 hours (8 starts). This is a service-specific rule, not a time-zone conversion. Not observed in game by this site.' if eventId=='kaira' else 'Shugo publishes separate service-local weekdays, start times and matching-group offsets. Korea/Taiwan rules are not converted copies of the Global schedule. Community reference; check in-game notices.')
data['updatedAt']='2026-11-01T00:00:00Z'
config.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Updated current sources to original artwork and annotated reviewed regional event rules.')
