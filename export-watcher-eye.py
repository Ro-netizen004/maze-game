import bpy, os
from mathutils import Vector

workspace = os.path.dirname(os.path.abspath(__file__))
source = os.path.join(workspace, 'src/assets/models/eyeballs-earthly-series-eyes-v4')
bpy.ops.wm.open_mainfile(filepath=os.path.join(source, 'source/Sketchfab_2023_08_12_03_35_47.blend'))
bpy.ops.object.select_all(action='DESELECT')
eye = next(obj for obj in bpy.data.objects if obj.type == 'MESH')
eye.select_set(True)
bpy.context.view_layer.objects.active = eye
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='LOOSE')
bpy.ops.object.mode_set(mode='OBJECT')
eyes = [obj for obj in bpy.context.selected_objects if obj.type == 'MESH']
eye = min(eyes, key=lambda obj: sum((obj.matrix_world @ Vector(corner)).x for corner in obj.bound_box))
for obj in list(bpy.data.objects):
    if obj != eye:
        bpy.data.objects.remove(obj, do_unlink=True)
bpy.context.view_layer.objects.active = eye
eye.select_set(True)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
modifier = eye.modifiers.new('Game detail', 'DECIMATE')
modifier.ratio = min(1, 6000 / len(eye.data.polygons))
bpy.ops.object.modifier_apply(modifier=modifier.name)
corners = [eye.matrix_world @ Vector(corner) for corner in eye.bound_box]
center = sum(corners, Vector()) / 8
diameter = max(max(v[i] for v in corners)-min(v[i] for v in corners) for i in range(3))
scale = 0.48 / diameter
for vertex in eye.data.vertices:
    vertex.co = (eye.matrix_world @ vertex.co - center) * scale
eye.matrix_world.identity()
eye.name = 'WatchersEye'
material = bpy.data.materials.new('Watcher eye texture')
material.use_nodes = True
nodes, links = material.node_tree.nodes, material.node_tree.links
shader = nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value = 0.35
texture = nodes.new('ShaderNodeTexImage')
texture.image = bpy.data.images.load(os.path.join(source, 'textures/EyesMainZB_EyeSet9_BaseColor_sRGB.png'), check_existing=False)
texture.image.scale(512, 512)
texture.image.pack()
links.new(texture.outputs['Color'], shader.inputs['Base Color'])
links.new(texture.outputs['Color'], shader.inputs['Emission Color'])
shader.inputs['Emission Strength'].default_value = 0.12
eye.data.materials.clear()
eye.data.materials.append(material)
for polygon in eye.data.polygons:
    polygon.use_smooth = True
output = os.path.join(workspace, 'public/models/watcher-eye')
os.makedirs(output, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output, 'watcher-eye.glb'), export_format='GLB', use_selection=True, export_yup=True, export_animations=False)
print('WATCHER_EYE_EXPORTED', len(eye.data.polygons), os.path.getsize(os.path.join(output, 'watcher-eye.glb')))
# A front view verifies the selected eye and texture before integration.
scene = bpy.context.scene
bpy.ops.object.camera_add(location=(0, -1.4, 0.35))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 0))-camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera = camera
bpy.ops.object.light_add(type='AREA', location=(0, -1, 1))
bpy.context.object.data.energy = 80
bpy.context.object.data.shape = 'DISK'
bpy.context.object.data.size = 2
scene.render.engine = 'CYCLES'
scene.cycles.samples = 8
scene.render.resolution_x = 384
scene.render.resolution_y = 384
scene.render.resolution_percentage = 100
scene.render.filepath = os.path.join(workspace, '.tools/watcher-eye-check.png')
bpy.ops.render.render(write_still=True)
