"""Explicit, source-attributed event rules. Regenerate only when intentionally editing data."""
from pathlib import Path
from copy import deepcopy
import json
root=Path(__file__).resolve().parent.parent
checked='2026-10-31T00:00:00Z'
sources=[
 dict(id='nc-cycle',title='NC: 3 December 2025 cycle update',url='https://about.ncsoft.com/news/article/aion2_update_251203',type='official'),
 dict(id='nc-kr',title='Korea: 3 December update notes',url='https://aion2.plaync.com/ko-kr/board/update/view?articleId=692f3e3834e7dd2024fd53a4',type='official'),
 dict(id='nc-tw',title='Taiwan: 3 December update notes',url='https://tw.ncsoft.com/aion2/board/update/view?articleId=692f4c48e81e402e6da16915',type='official'),
 dict(id='nc-tw-guide',title='Taiwan official Rift guide (15-minute portal)',url='https://tw.ncsoft.com/aion2/guidebook/view?title=%E6%99%82%E7%A9%BA%E8%A3%82%E7%B8%AB',type='official'),
 dict(id='shugo',title='Shugo service-local event schedules',url='https://shugo.gg/timers',type='community'),
 dict(id='metabot',title='MetaBot client schedule tables (UTC+9 Global interpretation)',url='https://metabot.gg/en/aion-2/events',type='community'),
 dict(id='atlas',title='Atlas UTC Global interpretation',url='https://aion2atlas.app/rift-timer/',type='community'),
 dict(id='wikily',title='Wikily field bosses and spawn locations',url='https://wikily.gg/aion-2/bosses/spawn-times',type='community')]
events={
 'rift':dict(name='Spacetime Rift',route='',category='rift'),
 'daily-reset':dict(name='Daily Reset',route='reset-timer/',category='reset'),
 'weekly-reset':dict(name='Weekly Reset',route='reset-timer/',category='reset'),
 'shugo':dict(name='Shugo Festival',route='shugo-festival/',category='event'),
 'invasion':dict(name='Dimensional Invasion',route='dimensional-invasion/',category='event'),
 'battlefield':dict(name='Battlefield / Arena of Tactics',route='battlefield/',category='pvp'),
 'artifact':dict(name='Artifact Siege',route='artifact-siege/',category='siege'),
 'siege-bosses':dict(name='Siege Bosses',route='world-boss-timer/',category='boss'),
 'nahma':dict(name='Guardian Lord Nahma',route='world-boss-timer/',category='boss'),
 'kaira':dict(name='Watcher Kaira',route='world-boss-timer/',category='boss'),
 'outland':dict(name='Abyss Outland',route='abyss-outland/',category='pvp'),
 'argo':dict(name='Argo, the Spirit King',route='argo-spirit-king/',category='boss'),
 'domination':dict(name='Spacetime Rift Domination',route='rift-domination/',category='pvp')}
def rule(zone,hours=None,minute=0,days=None,duration=0,confidence='community-agreed',sourceIds=None,**extra):
 return dict(zone=zone,hours=hours if hours is not None else list(range(24)),minute=minute,weekdays=days if days is not None else list(range(7)),durationMinutes=duration,confidence=confidence,sourceIds=sourceIds or ['shugo'],checkedAt=checked,validUntil=None,fold='first',**extra)
regions={}
for key,name,zone in [('na-east','NA East','America/New_York'),('na-west','NA West','America/Los_Angeles'),('europe','Europe / EU','Europe/Berlin'),('latam','Latin America','America/Sao_Paulo'),('asia','Global Asia','Asia/Seoul'),('korea','Korea','Asia/Seoul'),('taiwan','Taiwan','Asia/Taipei')]:
 global_service=key not in ('korea','taiwan')
 event={}
 event['rift']=rule(zone,list(range(2,24,3)),duration=60,confidence='disputed' if global_service else 'official',sourceIds=['shugo','metabot','atlas'] if global_service else (['nc-cycle','nc-kr','shugo'] if key=='korea' else ['nc-tw','nc-tw-guide','shugo']),entryMinutes=15 if key=='taiwan' else 10,note=('Global clock sources disagree. Select a published interpretation; this is not live server status.' if global_service else ('NC documents the three-hour cycle; hours match Shugo. The 10-minute entry / 60-minute event duration is community-reported.' if key=='korea' else 'Official Taiwan guide says 15-minute entry; 60-minute activity duration is community-reported.')))
 if global_service:
  event['rift']['variants']={
   'unified':dict(label='MetaBot · unified UTC+9',zone='Asia/Seoul',hours=list(range(0,24,3)),sourceIds=['metabot']),
   'utc':dict(label='Atlas · fixed UTC',zone='UTC',hours=list(range(0,24,3)),sourceIds=['atlas'])}
 resetzone='UTC' if global_service else zone
 event['daily-reset']=rule(resetzone,[7 if global_service else 5],sourceIds=['shugo','metabot'] if global_service else ['shugo'],note='Community schedule agreement; not an official or in-game observation claim.')
 event['weekly-reset']=rule(resetzone,[7 if global_service else 5],days=[3],sourceIds=['shugo','metabot'] if global_service else ['shugo'])
 for eid,minute,duration in [('shugo',0,10),('invasion',30,15)]:
  event[eid]=rule(zone,minute=minute,duration=duration,confidence='community-agreed' if global_service else 'community-reported',sourceIds=['shugo','metabot'] if global_service else ['shugo'],note='Hourly cadence agrees across Global references. Duration is the reported event window; minigame round/preparation times can differ.' if global_service else 'Duration is the reported event window; minigame round/preparation times can differ.')
 if key!='taiwan':
  event['battlefield']=rule(zone,[11,20] if key=='korea' else [11,19],duration=120,confidence='disputed',sourceIds=['shugo','metabot'],note='Morning end time is disputed: Shugo duration column says 120 min, its description and MetaBot say 11:00–14:00. Morning window shown as 180 min, evening 120 min.',durationByHour={'11':180})
 if global_service:
  event['artifact']=rule(zone,[21],days=[1,4,6],duration=30,confidence='disputed',sourceIds=['shugo','metabot'],groupOffsets=[0,5,10])
  event['siege-bosses']=rule(zone,[21],minute=30,days=[1,4,6],duration=30,confidence='disputed',sourceIds=['shugo','wikily','metabot'],groupOffsets=[0,5,10])
  event['nahma']=rule(zone,[21],days=[5,0],duration=30,confidence='disputed',sourceIds=['shugo','wikily','metabot'],groupOffsets=[0,5,10])
 else:
  offsets=[0,30,60] if key=='korea' else [0]
  event['artifact']=rule(zone,[21],minute=20 if key=='korea' else 30,days=[3,6],duration=30,groupOffsets=offsets)
  event['siege-bosses']=rule(zone,[21],minute=45,days=[3,6],duration=30,groupOffsets=offsets)
  event['nahma']=rule(zone,[22],days=[5,0],duration=30,groupOffsets=offsets)
 event['kaira']=rule(zone,list(range(1,24,3)) if global_service else list(range(0,24,4)),duration=30,confidence='disputed' if global_service else 'community-agreed',sourceIds=['shugo','wikily','metabot'] if global_service else ['shugo'])
 if key=='korea':
  event['outland']=rule(zone,[11,20],duration=150,confidence='disputed',note='Shugo gives 150 min but describes separate 30-minute matches and a longer evening range. Window is an estimate, not an exact matchmaking feed.')
  event['argo']=rule(zone,[9,21],duration=30,note='Shugo reports the 28 October addition. Wednesday maintenance can cancel a spawn; check in game.')
 if key=='taiwan': event['domination']=rule(zone,[20,23],days=[1,4,5],duration=0,confidence='official',sourceIds=['nc-tw-guide'],note='Official Taiwan guide describes these openings; duration is not stated.')
 if key=='korea': event['domination']=None
 if global_service:
  for eid,r in event.items():
   if r and eid not in ('rift','daily-reset','weekly-reset'):
    r['variants']={'unified':dict(label='MetaBot · unified UTC+9',zone='Asia/Seoul',sourceIds=['metabot'],**({'groupOffsets':[0]} if 'groupOffsets' in r else {}))}
 event['rift']['entryConfidence']='official' if key=='taiwan' else 'community-reported'
 if key=='korea':event['outland'].update(windowApproximate=True,matchMinutes=30)
 for r in event.values():
  if r and r['confidence']=='community-agreed' and len(r['sourceIds'])==1:r['confidence']='community-reported'
 regions[key]=dict(name=name,zone=zone,service='global' if global_service else key,events=event)
regions['global']=deepcopy(regions['na-east']);regions['global']['name']='Global · NA East reference';regions['global']['aliasOf']='na-east'
for reg in regions.values():
 for eid in ['kaira','artifact','siege-bosses','nahma']:
  reg['events'][eid]['checkedAt']='2026-11-01T00:00:00Z'
  reg['events'][eid]['note']='Service-specific community schedule; KR/TW Kaira uses a four-hour cycle, Global three hours. Weekdays and matching groups also differ by service. See Shugo service tables.'
data=dict(version=2,updatedAt='2026-11-01T00:00:00Z',publication=dict(enabled=False,artworkCleared=True),sources=sources,events=events,regions=regions)
(root/'src/data/schedules.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Site origin/language/indexing are operator-maintained; never overwrite them here.
print('Wrote v2 service-local rules, source interpretations and 13 event categories.')
