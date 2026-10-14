import bpy,os
from mathutils import Vector
root=os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(root,'src','shrub_tiles_pack_3_vars_seamless.glb'))
selected=[]
for variant in ['Small','Medium','Large']:
    objects=[obj for obj in bpy.context.scene.objects if obj.type=='MESH' and obj.name.startswith('TileExample '+variant+'_')]
    if len(objects)!=2: raise RuntimeError('Missing supplied shrub variant: '+variant)
    points=[obj.matrix_world @ Vector(v) for obj in objects for v in obj.bound_box]
    low=Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center=(low+high)/2; size=high-low
    parent=bpy.data.objects.new('Shrub'+variant,None);bpy.context.collection.objects.link(parent)
    for index,obj in enumerate(objects):
        world=obj.matrix_world.copy()
        for vertex in obj.data.vertices:
            p=world @ vertex.co
            vertex.co=Vector(((p.x-center.x)*2/size.x,(p.y-center.y)*2/size.y,(p.z-low.z)*2.4/size.z))
        obj.parent=parent;obj.matrix_world.identity();obj.name='Shrub'+variant+'Part'+str(index)
        selected.append(obj)
    selected.append(parent)
for obj in list(bpy.context.scene.objects):
    if obj not in selected:bpy.data.objects.remove(obj,do_unlink=True)
materials={mat for obj in selected if obj.type=='MESH' for mat in obj.data.materials}
images={node.image for mat in materials if mat.use_nodes for node in mat.node_tree.nodes if node.type=='TEX_IMAGE' and node.image}
folder=os.path.join(root,'.tools','shrub-textures');os.makedirs(folder,exist_ok=True)
for image in images:
    if len(image.pixels)==0:continue
    if image.packed_file:image.unpack(method='REMOVE')
    if max(image.size)>512:
        factor=512/max(image.size);image.scale(max(1,round(image.size[0]*factor)),max(1,round(image.size[1]*factor)))
    image.filepath_raw=os.path.join(folder,image.name.replace('/','_').replace('\\','_')+'.png');image.file_format='PNG';image.save()
output=os.path.join(root,'public','models','shrub-tiles');os.makedirs(output,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output,'shrubs.glb'),export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
print('SHRUB_TILES_READY',len(materials),'materials',sum(len(obj.data.polygons) for obj in selected if obj.type=='MESH'),'faces')
