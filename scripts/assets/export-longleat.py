import bpy, os, json, math
from mathutils import Vector
from mathutils.bvhtree import BVHTree

root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(root,'longleat_hedge_maze.glb'))
hedge=next(o for o in bpy.context.scene.objects if o.type=='MESH' and 'Hedge' in o.name)
ground=next(o for o in bpy.context.scene.objects if o.type=='MESH' and 'ground' in o.name)
points=[hedge.matrix_world @ Vector(v) for v in hedge.bound_box]
low=Vector(tuple(min(p[i] for p in points) for i in range(3)))
high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
center=(low+high)/2; scale=96/max(high.x-low.x,high.y-low.y)
for obj in [hedge,ground]:
    world=obj.matrix_world.copy()
    for vertex in obj.data.vertices:
        p=world @ vertex.co
        vertex.co=Vector(((p.x-center.x)*scale,(p.y-center.y)*scale,0 if obj==ground else (p.z-low.z)*scale))
    obj.parent=None; obj.matrix_world.identity()

# Blender XY becomes game X,-Z on GLB export.
clearings=[{'id':'north-rune','name':'The Listening Circle','position':[0,-24],'radius':5},
           {'id':'heart-rune','name':'The Keeper’s Circle','position':[0,0],'radius':5},
           {'id':'south-rune','name':'The Witness Circle','position':[0,24],'radius':5}]
for clearing in clearings:
    x,z=clearing['position']
    bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=clearing['radius'],depth=20,location=(x,-z,4))
    cutter=bpy.context.object
    bpy.context.view_layer.objects.active=hedge
    modifier=hedge.modifiers.new('Circular rune clearing','BOOLEAN'); modifier.operation='DIFFERENCE'; modifier.solver='EXACT'; modifier.object=cutter
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    bpy.data.objects.remove(cutter,do_unlink=True)

bpy.context.view_layer.update()
bvh=BVHTree.FromObject(hedge,bpy.context.evaluated_depsgraph_get())
cell=0.5
width=(high.x-low.x)*scale; depth=(high.y-low.y)*scale
columns=math.ceil(width/cell)+3; rows=math.ceil(depth/cell)+3
# Odd dimensions put the central rune at an exact grid center.
columns+=1-columns%2; rows+=1-rows%2
grid=[]
for r in range(rows):
    row=[]
    for c in range(columns):
        x=(c-(columns-1)/2)*cell; z=(r-(rows-1)/2)*cell
        hit=bvh.ray_cast(Vector((x,-z,20)),Vector((0,0,-1)),30)[0]
        row.append(1 if hit is not None else 0)
    grid.append(row)
# Only the outer movement border is blocked outside the supplied model.
for r in range(rows): grid[r][0]=grid[r][-1]=1
for c in range(columns): grid[0][c]=grid[-1][c]=1

# Find the connected authored paths, without carving or inventing corridors.
seen=set(); components=[]
for r in range(rows):
    for c in range(columns):
        if grid[r][c] or (r,c) in seen: continue
        queue=[(r,c)]; seen.add((r,c))
        for rr,cc in queue:
            for nr,nc in [(rr+1,cc),(rr-1,cc),(rr,cc+1),(rr,cc-1)]:
                if 0<=nr<rows and 0<=nc<columns and not grid[nr][nc] and (nr,nc) not in seen:
                    seen.add((nr,nc)); queue.append((nr,nc))
        components.append(queue)
main=max(components,key=len)
def nearest(x,z,margin=0.45):
    candidates=[]
    for r,c in main:
        px=(c-(columns-1)/2)*cell; pz=(r-(rows-1)/2)*cell
        # All four nearby samples must be hedge-free for a safe spawn/prop.
        if any(bvh.ray_cast(Vector((px+dx,-pz+dy,20)),Vector((0,0,-1)),30)[0] is not None for dx,dy in [(margin,0),(-margin,0),(0,margin),(0,-margin)]): continue
        candidates.append(((px-x)**2+(pz-z)**2,[r,c]))
    if not candidates: raise RuntimeError('No safe corridor site')
    return min(candidates)[1]
for clearing in clearings:
    clearing['cell']=nearest(*clearing['position'])
    if math.dist([(clearing['cell'][1]-(columns-1)/2)*cell,(clearing['cell'][0]-(rows-1)/2)*cell],clearing['position'])>1:
        raise RuntimeError('Rune clearing is disconnected: '+clearing['id'])
sites=[nearest(-width/2+3,-depth/2+4),nearest(width/2-3,-depth/2+8),nearest(width/2-4,depth/2-9),nearest(-width/2+4,depth/2-9),nearest(-width/2+4,0)]
layout={'grid':grid,'cellSize':cell,'clearings':clearings,'journalCells':sites,'start':nearest(width/2-3,depth/2-3),'end':nearest(width/2-3,-depth/2+3),'bounds':{'left':-columns*cell/2,'right':columns*cell/2,'front':-rows*cell/2,'back':rows*cell/2},'source':'Longleat Hedge Maze by Marius Dobre','components':[len(c) for c in sorted(components,key=len,reverse=True)[:10]]}
world=os.path.join(root,'src','game','world','longleatLayout.json')
with open(world,'w',encoding='utf-8') as f: json.dump(layout,f,separators=(',',':'))

# Remove preview characters, bridges and platforms; keep the authored hedge plan
# and ground. Ground is leveled for the game's fixed-height first-person controls.
for obj in list(bpy.context.scene.objects):
    if obj not in [hedge,ground]: bpy.data.objects.remove(obj,do_unlink=True)
for image in bpy.data.images:
    if image.has_data and max(image.size)>1024:
        factor=1024/max(image.size);image.scale(round(image.size[0]*factor),round(image.size[1]*factor))
output=os.path.join(root,'public','models','longleat-maze');os.makedirs(output,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output,'maze.glb'),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)

# Match the game's circular soil overlays in the review image.
for clearing in clearings:
    x,z=clearing['position']
    bpy.ops.mesh.primitive_circle_add(vertices=64,radius=clearing['radius']-0.2,fill_type='NGON',location=(x,-z,0.012))
    mat=bpy.data.materials.new('Clearing soil');mat.diffuse_color=(0.48,0.47,0.39,1)
    mat.use_nodes=True;mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=mat.diffuse_color
    bpy.context.object.data.materials.append(mat)

bpy.ops.object.camera_add(location=(0,0,100))
camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=100;camera.data.clip_end=300
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='BLENDER_WORKBENCH';scene.display.shading.light='STUDIO';scene.display.shading.color_type='TEXTURE';scene.display.shading.show_shadows=True
scene.render.resolution_x=850;scene.render.resolution_y=1250;scene.render.resolution_percentage=100
scene.render.filepath=os.path.join(root,'docs','layout','longleat-clearings.png')
bpy.ops.render.render(write_still=True)
print('LONGLEAT_READY',rows,columns,'components',layout['components'],'clearings',[(x['id'],x['cell']) for x in clearings])
