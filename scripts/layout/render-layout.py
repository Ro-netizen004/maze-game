import json, math, random
from PIL import Image, ImageDraw, ImageFont
data=json.load(open('docs/layout/forest-layout.json', encoding='utf-8'))
random.seed(4)
im=Image.new('RGB',(1400,1120),'#101f22'); d=ImageDraw.Draw(im)
fontpath='C:/Windows/Fonts/segoeui.ttf'
font=ImageFont.truetype(fontpath,20); small=ImageFont.truetype(fontpath,16); title=ImageFont.truetype(fontpath,34)
d.text((50,26),'THE KEEPER’S FOREST · TREE LABYRINTH',font=title,fill='#e3eddf')
d.text((50,73),'Actual gameplay map · 50 × 50 m · North ↑',font=font,fill='#9db9ad')
ox,oy,step=50,135,36
d.rounded_rectangle((ox-8,oy-8,ox+900+8,oy+900+8),radius=12,fill='#827c5b')
for r,row in enumerate(data['grid']):
 for c,wall in enumerate(row):
  x,y=ox+c*step+18,oy+r*step+18
  if wall:
   d.ellipse((x-21,y-17,x+21,y+24),fill='#676d4b')
   for dx,dy,rad in [(-8,6,15),(9,5,14),(0,-7,16)]:
    col=random.choice(['#284b39','#345b3e','#426548','#355c43'])
    d.ellipse((x+dx-rad,y+dy-rad,x+dx+rad,y+dy+rad),fill=col,outline='#53734a',width=1)
   d.line((x,y+3,x,y+13),fill='#a39869',width=3)
for i,j in enumerate(data['journals'],1):
 r,c=j['cell']; x,y=ox+c*step+18,oy+r*step+18
 d.rounded_rectangle((x-12,y-10,x+12,y+10),radius=3,fill=j['color'],outline='#152c27',width=2)
 d.line((x,y-8,x,y+8),fill='#34443b',width=2)
 d.text((x+15,y-14),str(i),font=font,fill='#17291f',stroke_width=1,stroke_fill='#d6d7b7')
for j in data['rituals']:
 r,c=j['cell']; x,y=ox+c*step+18,oy+r*step+18
 d.ellipse((x-12,y-12,x+12,y+12),outline='#b2ede3',width=3)
 pts=[(x+9*math.cos(a*math.pi*4/5-math.pi/2),y+9*math.sin(a*math.pi*4/5-math.pi/2)) for a in range(6)]
 d.line(pts,fill='#173f37',width=2)
for label,cell,color in [('START',data['start'],'#e4eee3'),('EXIT',data['end'],'#abd9ff')]:
 r,c=cell;x,y=ox+c*step+18,oy+r*step+18
 d.ellipse((x-8,y-8,x+8,y+8),fill=color,outline='#183c33',width=2)
 d.text((x-26,y+12),label,font=small,fill='#182d26',stroke_width=1,stroke_fill='#d1d4ae')
d.text((1000,155),'FIND & AWAKEN',font=font,fill='#e3eddf')
for i,j in enumerate(data['journals'],1):
 y=215+(i-1)*92
 d.text((1000,y),f'{i:02}  {j["name"]}',font=font,fill=j['color'])
 d.text((1000,y+31),'Journal + nearby ritual circle',font=small,fill='#a7bdb2')
for i,line in enumerate(['Trees form solid barriers.','Walk through the tan corridors.','Broken rings offer alternate routes.','Collect all five journals.','Activate all five rune circles.','Escape at the southeast Old Road.']):
 d.text((1000,740+i*38),line,font=small,fill='#b8cbbf')
d.text((50,1060),'Layout drawn from the game grid. Tree symbols show barrier cells; in-game foliage is instanced 3D vegetation.',font=small,fill='#a7bdb2')
im.save('docs/layout/forest-layout.png')
