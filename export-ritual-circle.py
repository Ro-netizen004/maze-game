import bpy
import os

workspace = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(workspace, 'src', 'occult-ritual-circle-stylized-prop', 'source', 'satanic circle.glb'))
meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
faces = sum(len(obj.data.polygons) for obj in meshes)
ratio = min(1, 12000 / max(1, faces))
for obj in meshes:
    bpy.context.view_layer.objects.active = obj
    if ratio < 1:
        modifier = obj.modifiers.new(name='Browser geometry budget', type='DECIMATE')
        modifier.ratio = ratio
        modifier.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
texture_folder = os.path.join(workspace, '.tools', 'ritual-textures')
os.makedirs(texture_folder, exist_ok=True)
for image in bpy.data.images:
    if image.source != 'FILE' or len(image.pixels) == 0:
        continue
    if image.packed_file:
        image.unpack(method='REMOVE')
    if max(image.size) > 1024:
        scale = 1024 / max(image.size)
        image.scale(max(1, round(image.size[0] * scale)), max(1, round(image.size[1] * scale)))
    image.filepath_raw = os.path.join(texture_folder, image.name.replace('/', '_').replace('\\', '_') + '.png')
    image.file_format = 'PNG'
    image.save()
    print('RITUAL_TEXTURE', image.name, tuple(image.size))
output = os.path.join(workspace, 'public', 'models', 'ritual-circle')
os.makedirs(output, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output, 'ritual-circle.glb'), export_format='GLB', export_yup=True, export_animations=False)
print('RITUAL_EXPORT', faces, sum(len(obj.data.polygons) for obj in bpy.context.scene.objects if obj.type == 'MESH'))
