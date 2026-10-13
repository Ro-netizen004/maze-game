import bpy, os, math, random
from mathutils import Vector, Matrix
root=os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(root,'src','a_forest_3_with_a_road_at_night_for_game.glb'))
rows=['#.#######','#...#...#','###.#.#.#','#.....#.#','#.#####.#','#...#...#','###.#.###','#.......#','#######.#']
gates={(2,3),(7,6),(8,7)}
walls=[((c-4)*2,(4-r)*2) for r,row in enumerate(rows) for c,ch in enumerate(row) if ch=='#' and (r,c) not in gates]
trunks=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0].name=='Material.004']
anchors=[]
for o in trunks:
 p=[o.matrix_world@Vector(v) for v in o.bound_box]
 anchors.append(Vector(((min(v.x for v in p)+max(v.x for v in p))/2,(min(v.y for v in p)+max(v.y for v in p))/2,min(v.z for v in p))))
# Distribute remaining trees outside the playable square.
targets=walls+[(side*(10+(i//4)%3*2),-11+(i%12)*2) if i%2 else (-11+(i%12)*2,side*(10+(i//4)%3*2)) for i in range(len(trunks)) for side in [1 if i%4<2 else -1]]
for o in list(bpy.context.scene.objects):
 if o.type!='MESH': continue
 matrix=o.matrix_world.copy()
 o.parent=None
 o.data=o.data.copy(); o.data.transform(matrix); o.matrix_world=Matrix.Identity(4)
 mat=o.data.materials[0].name
 if mat=='Material.003':
  xs=[v.co.x for v in o.data.vertices]; ys=[v.co.y for v in o.data.vertices]
  for v in o.data.vertices:
   v.co.x=(v.co.x-(min(xs)+max(xs))/2)*32/(max(xs)-min(xs))
   v.co.y=(v.co.y-(min(ys)+max(ys))/2)*32/(max(ys)-min(ys)); v.co.z=-0.02
 else:
  center=sum((v.co for v in o.data.vertices),Vector())/len(o.data.vertices)
  i=min(range(len(anchors)),key=lambda i:(center.x-anchors[i].x)**2+(center.y-anchors[i].y)**2)
  anchor=anchors[i]; tx,ty=targets[i]
  for v in o.data.vertices:
   v.co=Vector((tx+max(-0.78,min(0.78,(v.co.x-anchor.x)*2.4)),ty+max(-0.78,min(0.78,(v.co.y-anchor.y)*2.4)),max(0,(v.co.z-anchor.z)*2.4)))
# Keep texture files small and explicitly replace packed originals.
for image in bpy.data.images:
 if image.source!='FILE' or not len(image.pixels): continue
 if image.packed_file: image.unpack(method='REMOVE')
 if max(image.size)>512:
  factor=512/max(image.size); image.scale(max(1,round(image.size[0]*factor)),max(1,round(image.size[1]*factor)))
 folder=os.path.join(root,'.tools','first-forest-textures'); os.makedirs(folder,exist_ok=True)
 image.filepath_raw=os.path.join(folder,image.name.replace('/','_').replace('\\','_')+'.png'); image.file_format='PNG'; image.save()
groups={}
for o in list(bpy.context.scene.objects):
 if o.type=='MESH': groups.setdefault(o.data.materials[0],[]).append(o)
for mat,objects in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects: o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]; bpy.ops.object.join()
 obj=objects[0]; obj.name='ForestStage_'+mat.name
 if mat.name!='Material.003':
  modifier=obj.modifiers.new('Simplify','DECIMATE'); modifier.ratio=0.5; bpy.ops.object.modifier_apply(modifier=modifier.name)
output=os.path.join(root,'public','models','first-forest'); os.makedirs(output,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output,'stage.glb'),export_format='GLB',export_animations=False)
print('FIRST_FOREST_EXPORTED',os.path.getsize(os.path.join(output,'stage.glb')))
