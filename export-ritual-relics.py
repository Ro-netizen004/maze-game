import bpy, os
from mathutils import Vector, Matrix

workspace = os.path.dirname(os.path.abspath(__file__))
sources = [
    ('moon-tear', 'src/potion-bottle-inspired-by-death-becomes-her/source/Sketchfab_2023_06_06_13_28_48.blend', 0.55),
    ('sun-ember', 'src/fnaf_wall_sun.glb', 0.6),
    ('ritual-candle', 'src/candle_light_animated.glb', 0.46),
]
for name, path, target in sources:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if path.endswith('.blend'): bpy.ops.wm.open_mainfile(filepath=os.path.join(workspace,path))
    else: bpy.ops.import_scene.gltf(filepath=os.path.join(workspace,path))
    bpy.context.scene.frame_set(1)
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = Vector(tuple(min(v[i] for v in corners) for i in range(3)))
    maximum = Vector(tuple(max(v[i] for v in corners) for i in range(3)))
    center = (minimum+maximum)/2
    scale = target / (max(maximum-minimum) if name=='sun-ember' else maximum.z-minimum.z)
    origin = Vector((center.x,center.y,minimum.z))
    for obj in meshes:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        for modifier in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=modifier.name)
        world = obj.matrix_world.copy()
        for vertex in obj.data.vertices:
            vertex.co = (world @ vertex.co-origin)*scale
            if name=='sun-ember':
                vertex.co.x *= -1
                vertex.co.y *= -1
        obj.parent = None
        obj.matrix_world = Matrix.Identity(4)
        obj.animation_data_clear()
        if len(obj.data.polygons)>1500:
            modifier = obj.modifiers.new('Game detail','DECIMATE')
            modifier.ratio = 1500/len(obj.data.polygons)
            bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.select_set(False)
    if name=='moon-tear':
        # Replace Blender-only procedural/glass nodes with portable glTF materials.
        for material in {m for obj in meshes for m in obj.data.materials if m}:
            old = material.name.lower()
            color = (0.66,0.43,0.12,1) if 'gold' in old else (0.2,0.3,0.75,1) if 'potion' in old else (0.27,0.44,0.65,1)
            material.use_nodes = True
            material.node_tree.nodes.clear()
            shader=material.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
            shader.inputs['Base Color'].default_value=color
            shader.inputs['Metallic'].default_value=0.75 if 'gold' in old else 0.12
            shader.inputs['Roughness'].default_value=0.27
            output=material.node_tree.nodes.new('ShaderNodeOutputMaterial')
            material.node_tree.links.new(shader.outputs['BSDF'],output.inputs['Surface'])
    texture_folder=os.path.join(workspace,'.tools',name+'-textures')
    os.makedirs(texture_folder,exist_ok=True)
    for image in bpy.data.images:
        if image.type=='RENDER_RESULT' or image.name.endswith('.hdr') or image.size[0]==0: continue
        _ = image.pixels[0]
        if image.packed_file: image.unpack(method='REMOVE')
        if max(image.size)>512:
            factor=512/max(image.size)
            image.scale(max(1,round(image.size[0]*factor)),max(1,round(image.size[1]*factor)))
        image.filepath_raw=os.path.join(texture_folder,image.name.replace('/','_')+'.png')
        image.file_format='PNG'
        image.save()
        image.pack()
    bpy.ops.object.select_all(action='DESELECT')
    for obj in meshes: obj.select_set(True)
    output=os.path.join(workspace,'public/models',name)
    os.makedirs(output,exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(output,name+'.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False)
    print('RELIC_EXPORT',name,sum(len(obj.data.polygons) for obj in meshes),os.path.getsize(os.path.join(output,name+'.glb')))
