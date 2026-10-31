from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
root=Path(__file__).resolve().parent.parent
(root/'public/icons').mkdir(parents=True,exist_ok=True)
for size in (192,512):
 image=Image.new('RGB',(size,size),'#101113');draw=ImageDraw.Draw(image)
 points=[(.5,.16),(.59,.41),(.84,.5),(.59,.59),(.5,.84),(.41,.59),(.16,.5),(.41,.41)]
 draw.polygon([(round(x*size),round(y*size)) for x,y in points],fill='#d8bb86')
 points=[(.5,.36),(.54,.46),(.64,.5),(.54,.54),(.5,.64),(.46,.54),(.36,.5),(.46,.46)]
 draw.polygon([(round(x*size),round(y*size)) for x,y in points],fill='#101113')
 image.save(root/f'public/icons/icon-{size}.png')
image=ImageOps.fit(Image.open(root/'public/assets/wallpaperBg13.webp').convert('RGB'),(1200,630))
overlay=Image.new('RGBA',image.size);pixels=overlay.load()
for x in range(1200):
 alpha=round(230*(1-x/1200))
 for y in range(630):pixels[x,y]=(8,10,13,alpha)
image=Image.alpha_composite(image.convert('RGBA'),overlay);draw=ImageDraw.Draw(image)
try:font=ImageFont.truetype('C:/Windows/Fonts/georgia.ttf',78);small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',26)
except OSError:font=ImageFont.load_default(size=78);small=ImageFont.load_default(size=26)
draw.text((65,170),'AION 2',font=font,fill='#f5f0e7');draw.text((65,270),'RIFT TIMER',font=font,fill='#d8bb86');draw.text((70,385),'YOUR NEXT CROSSING. YOUR LOCAL TIME.',font=small,fill='#eee3ce');draw.text((70,566),'Independent fan tool / Art © NC Corporation',font=ImageFont.load_default(size=18),fill='#d5c9b8')
image.convert('RGB').save(root/'public/assets/social-card.jpg',quality=88)
print('Created 192/512 install icons and 1200x630 share image.')
