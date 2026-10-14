import bpy
import os

workspace = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.open_mainfile(filepath=os.path.join(workspace, 'src', 'flashlight', 'source', 'Flashlight.blend'))
texture_dir = os.path.join(workspace, 'src', 'flashlight', 'textures')
for image in bpy.data.images:
    if image.source != 'FILE':
        continue
    candidate = os.path.join(texture_dir, os.path.basename(image.filepath.replace('\\', '/')))
    if os.path.isfile(candidate):
        image.filepath = candidate
        image.reload()
    if len(image.pixels) == 0:
        continue
    print('FLASHLIGHT_TEXTURE', image.name, list(image.size))
    if image.packed_file:
        image.unpack(method='REMOVE')
    if max(image.size) > 1024:
        factor = 1024 / max(image.size)
        image.scale(max(1, round(image.size[0] * factor)), max(1, round(image.size[1] * factor)))
    game_textures = os.path.join(workspace, '.tools', 'flashlight-textures')
    os.makedirs(game_textures, exist_ok=True)
    image.filepath_raw = os.path.join(game_textures, image.name.replace('/', '_').replace('\\', '_') + '.png')
    image.file_format = 'PNG'
    image.save()

bpy.ops.object.select_all(action='DESELECT')
meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH' and not any(word in obj.name.lower() for word in ['ground', 'floor', 'plane', 'hand'])]
for obj in meshes:
    obj.rotation_euler = (0, 0, 0)
    obj.location = (0, 0, 0)
    obj.select_set(True)
    print('FLASHLIGHT_OBJECT', obj.name, list(obj.dimensions))
output = os.path.join(workspace, 'public', 'models', 'flashlight')
os.makedirs(output, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output, 'flashlight.glb'), export_format='GLB', use_selection=True, export_yup=True, export_animations=False)
print('FLASHLIGHT_EXPORTED', os.path.join(output, 'flashlight.glb'))
